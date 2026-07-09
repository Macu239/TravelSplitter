const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const Expense = require("../models/Expense");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/trips/:id/balance
//
// Returns:
//   balances[]  — per-member paid / owed / net
//   settlements[] — minimal payment instructions (who pays whom how much)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id/balance", async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    const expenses = await Expense.find({ tripId: req.params.id });

    const memberNames = trip.members.map((m) => m.name);

    // ── Step 1: accumulate paid and owed per member ──────────────────────────
    const paid = {}; // total each member has paid out
    const owed = {}; // total each member owes (their share of each expense)

    memberNames.forEach((name) => {
      paid[name] = 0;
      owed[name] = 0;
    });

    expenses.forEach((exp) => {
      // Credit the payer
      if (paid[exp.paidBy] !== undefined) {
        paid[exp.paidBy] += exp.amount;
      }

      // Debit each participant their equal share
      const share = exp.amount / exp.participants.length;
      exp.participants.forEach((participant) => {
        if (owed[participant] !== undefined) {
          owed[participant] += share;
        }
      });
    });

    // ── Step 2: compute net balance per member ───────────────────────────────
    // positive net → others owe this person
    // negative net → this person owes others
    const balances = memberNames.map((name) => ({
      name,
      paid: round(paid[name]),
      owed: round(owed[name]),
      net: round(paid[name] - owed[name]),
    }));

    // ── Step 3: greedy settlement (minimises transaction count) ─────────────
    const settlements = computeSettlements(balances);

    // ── Step 4: trip-level summary ───────────────────────────────────────────
    const totalSpend = round(expenses.reduce((sum, e) => sum + e.amount, 0));

    res.json({
      tripId: req.params.id,
      tripName: trip.name,
      totalSpend,
      expenseCount: expenses.length,
      balances,
      settlements,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Greedy creditor/debtor matching algorithm
// Works in O(n²) which is fine for trip group sizes (3–20 people)
// ─────────────────────────────────────────────────────────────────────────────
function computeSettlements(balances) {
  // Deep-copy so we can mutate without affecting the original balances array
  const debtors = balances
    .filter((b) => b.net < -0.01)
    .map((b) => ({ name: b.name, amount: -b.net }));
  const creditors = balances
    .filter((b) => b.net > 0.01)
    .map((b) => ({ name: b.name, amount: b.net }));

  const transactions = [];
  let d = 0;
  let c = 0;

  while (d < debtors.length && c < creditors.length) {
    const transferAmount = Math.min(debtors[d].amount, creditors[c].amount);

    if (transferAmount > 0.01) {
      transactions.push({
        from: debtors[d].name,
        to: creditors[c].name,
        amount: round(transferAmount),
      });
    }

    debtors[d].amount -= transferAmount;
    creditors[c].amount -= transferAmount;

    if (debtors[d].amount < 0.01) d++;
    if (creditors[c].amount < 0.01) c++;
  }

  return transactions;
}

// Round to 2 decimal places — avoids floating point leakage in JSON output
function round(n) {
  return Math.round(n * 100) / 100;
}

module.exports = router;
