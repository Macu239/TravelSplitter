// components/AddExpenseModal.jsx
import { useState, useEffect } from "react";
import Avatar from "./Avatar";
import { addExpense, updateExpense } from "../api";
import "./AddExpenseModal.css";

export default function AddExpenseModal({
  trip,
  onClose,
  onSaved,
  editingExp,
  initialValues,
}) {
  const members = trip.members.map((m) => m.name);

  const [form, setForm] = useState({
    description: "",
    amount: "",
    paidBy: "",
    participants: [...members], // default: everyone
    date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    if (editingExp && initialValues) {
      setForm({
        description: initialValues.description || "",
        amount: initialValues.amount || "",
        paidBy: initialValues.paidBy || "",
        participants: initialValues.participants || [],
        date: initialValues.date
          ? new Date(initialValues.date).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
      });
    }
  }, [editingExp]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function toggleParticipant(name) {
    setForm((f) => ({
      ...f,
      participants: f.participants.includes(name)
        ? f.participants.filter((p) => p !== name)
        : [...f.participants, name],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!form.amount || Number(form.amount) <= 0) {
      return setError("Enter a valid amount");
    }
    if (!form.paidBy) return setError("Select who paid");
    if (form.participants.length === 0)
      return setError("Select at least one participant");

    setSaving(true);
    try {
      let savedExpense;
      if (editingExp) {
        savedExpense = await updateExpense(editingExp._id, {
          paidBy: form.paidBy,
          amount: parseFloat(form.amount),
          participants: form.participants,
          description: form.description,
          date: form.date,
        });
      } else {
        savedExpense = await addExpense({
          tripId: trip._id,
          paidBy: form.paidBy,
          amount: parseFloat(form.amount),
          participants: form.participants,
          description: form.description,
          date: form.date,
        });
      }
      onSaved(savedExpense);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal">
        <div className="modalHeader">
          <span className="modalTitle">
            {editingExp ? "Edit expense" : "Add expense"}
          </span>
          <button className="closeBtn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Description (optional)</label>
            <input
              className="input"
              placeholder="Dinner, hotel, taxi..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>

          <div className="field amountAndDate">
            <div className="amountDateCol">
              <label className="label">Amount ($)</label>
              <input
                className="input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
            <div className="amountDateCol">
              <label className="label">Date</label>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, date: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Paid by</label>
            <select
              className="input"
              value={form.paidBy}
              onChange={(e) =>
                setForm((f) => ({ ...f, paidBy: e.target.value }))
              }
            >
              <option value="">Select...</option>
              {members.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="label">
              Who shared this?{" "}
              <span className="participantsCount">
                ({form.participants.length} of {members.length})
              </span>
            </label>
            <div className="checkGrid">
              {members.map((m, i) => {
                const checked = form.participants.includes(m);
                return (
                  <label
                    key={m}
                    className={`checkItem ${checked ? "checkItemChecked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleParticipant(m)}
                    />
                    <Avatar name={m} index={i} size={22} />
                    <span>{m}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && <p className="errorStyle">{error}</p>}

          <div className="formActions">
            <button type="button" className="btnSecondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btnPrimary" disabled={saving}>
              {saving ? "Saving..." : "Save expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


