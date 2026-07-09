const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const Trip = require("../models/Trip");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/expenses
// Add a new expense to a trip
// Body: { tripId, paidBy, amount, participants, description?, date? }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { tripId, paidBy, amount, participants, description, date } =
      req.body;

    // ── Validate required fields ──
    if (!tripId) return res.status(400).json({ error: "tripId is required" });
    if (!paidBy) return res.status(400).json({ error: "paidBy is required" });
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ error: "amount must be a positive number" });
    }
    if (!Array.isArray(participants) || participants.length === 0) {
      return res
        .status(400)
        .json({ error: "participants must be a non-empty array" });
    }

    // ── Verify trip exists ──
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // ── Validate paidBy and participants are actual trip members ──
    const memberNames = trip.members.map((m) => m.name);

    if (!memberNames.includes(paidBy)) {
      return res.status(400).json({
        error: `paidBy "${paidBy}" is not a member of this trip`,
        validMembers: memberNames,
      });
    }

    const invalidParticipants = participants.filter(
      (p) => !memberNames.includes(p),
    );
    if (invalidParticipants.length > 0) {
      return res.status(400).json({
        error: `Invalid participants: ${invalidParticipants.join(", ")}`,
        validMembers: memberNames,
      });
    }

    // ── Create expense ──
    const expense = await Expense.create({
      tripId,
      paidBy,
      amount: parseFloat(Number(amount).toFixed(2)),
      participants,
      description: description ? String(description).trim() : "",
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/expenses/:id
// Remove a single expense
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json({ message: "Expense deleted", expenseId: req.params.id });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const { paidBy, amount, participants, description, date } = req.body;

    // ── Validate required fields ──
    if (!paidBy) return res.status(400).json({ error: "paidBy is required" });
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ error: "amount must be a positive number" });
    }
    if (!Array.isArray(participants) || participants.length === 0) {
      return res
        .status(400)
        .json({ error: "participants must be a non-empty array" });
    }

    // ── Load the existing expense to find which trip it belongs to ──
    const existingExpense = await Expense.findById(req.params.id);
    if (!existingExpense)
      return res.status(404).json({ error: "Expense not found" });

    // ── Verify trip exists ──
    const trip = await Trip.findById(existingExpense.tripId);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    // ── Validate paidBy and participants are actual trip members ──
    const memberNames = trip.members.map((m) => m.name);

    if (!memberNames.includes(paidBy)) {
      return res.status(400).json({
        error: `paidBy "${paidBy}" is not a member of this trip`,
        validMembers: memberNames,
      });
    }

    const invalidParticipants = participants.filter(
      (p) => !memberNames.includes(p),
    );
    if (invalidParticipants.length > 0) {
      return res.status(400).json({
        error: `Invalid participants: ${invalidParticipants.join(", ")}`,
        validMembers: memberNames,
      });
    }

    //Update the expense
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        paidBy,
        amount: parseFloat(Number(amount).toFixed(2)),
        participants,
        description: description ? String(description).trim() : "",
        date: date ? new Date(date) :  existingExpense.date,
      },
      { new: true },
    );
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
