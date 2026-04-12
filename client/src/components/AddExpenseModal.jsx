// components/AddExpenseModal.jsx
import { useState } from 'react';
import Avatar from './Avatar';
import { addExpense } from '../api';

export default function AddExpenseModal({ trip, onClose, onSaved }) {
  const members = trip.members.map((m) => m.name);

  const [form, setForm] = useState({
    description: '',
    amount: '',
    paidBy: '',
    participants: [...members], // default: everyone
    date: new Date().toISOString().slice(0, 10),
  });
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
      return setError('Enter a valid amount');
    }
    if (!form.paidBy) return setError('Select who paid');
    if (form.participants.length === 0) return setError('Select at least one participant');

    setSaving(true);
    try {
      await addExpense({
        tripId: trip._id,
        paidBy: form.paidBy,
        amount: parseFloat(form.amount),
        participants: form.participants,
        description: form.description,
        date: form.date,
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modal}>
        <div style={modalHeader}>
          <span style={{ fontWeight: 600, fontSize: 16 }}>Add expense</span>
          <button style={closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={field}>
            <label style={label}>Description (optional)</label>
            <input
              style={input}
              placeholder="Dinner, hotel, taxi..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>Amount ($)</label>
              <input
                style={input}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>Date</label>
              <input
                style={input}
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              />
            </div>
          </div>

          <div style={field}>
            <label style={label}>Paid by</label>
            <select
              style={input}
              value={form.paidBy}
              onChange={(e) => setForm((f) => ({ ...f, paidBy: e.target.value }))}
            >
              <option value="">Select...</option>
              {members.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div style={field}>
            <label style={label}>
              Who shared this?{' '}
              <span style={{ color: '#888', fontWeight: 400 }}>
                ({form.participants.length} of {members.length})
              </span>
            </label>
            <div style={checkGrid}>
              {members.map((m, i) => {
                const checked = form.participants.includes(m);
                return (
                  <label key={m} style={{ ...checkItem, background: checked ? '#F5F3FF' : 'transparent' }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleParticipant(m)}
                      style={{ accentColor: '#534AB7' }}
                    />
                    <Avatar name={m} index={i} size={22} />
                    <span style={{ fontSize: 13 }}>{m}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {error && <p style={errorStyle}>{error}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" style={btnSecondary} onClick={onClose}>Cancel</button>
            <button type="submit" style={btnPrimary} disabled={saving}>
              {saving ? 'Saving...' : 'Save expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlay = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 100, padding: '1rem',
};
const modal = {
  background: '#fff', borderRadius: 12, padding: '1.5rem',
  width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
};
const modalHeader = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16,
};
const closeBtn = {
  background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#666', padding: 4,
};
const field = { marginBottom: 12 };
const label = { display: 'block', fontSize: 12, color: '#666', marginBottom: 4, fontWeight: 500 };
const input = {
  width: '100%', padding: '8px 10px', fontSize: 14, fontFamily: 'inherit',
  border: '0.5px solid #ccc', borderRadius: 8, background: '#fafafa', outline: 'none', boxSizing: 'border-box',
};
const checkGrid = {
  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4,
};
const checkItem = {
  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
  border: '0.5px solid #e5e5e5', borderRadius: 8, fontSize: 13, cursor: 'pointer',
};
const errorStyle = { color: '#A32D2D', fontSize: 13, marginTop: 8 };
const btnPrimary = {
  padding: '8px 16px', background: '#534AB7', color: '#fff', border: 'none',
  borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
};
const btnSecondary = {
  padding: '8px 16px', background: 'transparent', color: '#333',
  border: '0.5px solid #ccc', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
};
