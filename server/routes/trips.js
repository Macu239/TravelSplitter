const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const Expense = require("../models/Expense");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/trips
// Create a new trip with members
// Body: { name: string, members: string[] }
// ─────────────────────────────────────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { name, members } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Trip name is required" });
    }

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({ error: "At least one member is required" });
    }

    // Deduplicate and sanitise member names
    const uniqueNames = [
      ...new Set(members.map((m) => String(m).trim()).filter(Boolean)),
    ];

    if (uniqueNames.length === 0) {
      return res.status(400).json({ error: "Member names cannot be empty" });
    }

    const trip = await Trip.create({
      name: name.trim(),
      members: uniqueNames.map((name) => ({ name })),
    });

    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/trips/:id
// Get trip info (members, metadata)
// ─────────────────────────────────────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    res.json(trip);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/trips/:id
// Update trip name or add/remove members (post-MVP utility)
// ─────────────────────────────────────────────────────────────────────────────
router.patch("/:id", async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const update = {};

    if (name) update.name = name.trim();
    if (Array.isArray(members)) {
      const unique = [
        ...new Set(members.map((m) => String(m).trim()).filter(Boolean)),
      ];
      update.members = unique.map((name) => ({ name }));
    }

    const trip = await Trip.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!trip) return res.status(404).json({ error: "Trip not found" });

    res.json(trip);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/trips/:id
// Delete trip and all its expenses
// ─────────────────────────────────────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });

    await Expense.deleteMany({ tripId: req.params.id });

    res.json({
      message: "Trip and all expenses deleted",
      tripId: req.params.id,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/expenses", async (req, res) => {
  const expenses = await Expense.find({ tripId: req.params.id });
  res.json(expenses);
});

module.exports = router;
