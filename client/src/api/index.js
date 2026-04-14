// ─────────────────────────────────────────────────────────────────────────────
// api/index.js
// Centralised API client — all backend calls live here.
// The CRA proxy setting in package.json forwards /api/* to localhost:5000.
// ─────────────────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL ||"http://localhost:3001/api"

const BASE = `${API}/api`;

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    console.error("Non-JSON response:", text);
    throw new Error("Backend did not return JSON (likely wrong route)");
  }

  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }

  return data;
}

// ── Trip ──────────────────────────────────────────────────────────────────────

/** Create a trip. members is string[]. */
export const createTrip = (name, members) =>
  request("/trips", { method: "POST", body: { name, members } });

/** Fetch trip info by id. */
export const getTrip = (tripId) => request(`/trips/${tripId}`);

/** Fetch all expenses for a trip. */
export const getTripExpenses = (tripId) => request(`/trips/${tripId}/expenses`);

/** Fetch balance summary + settlement instructions. */
export const getTripBalance = (tripId) => request(`/trips/${tripId}/balance`);

// ── Expense ───────────────────────────────────────────────────────────────────

/**
 * Add an expense.
 * @param {{ tripId, paidBy, amount, participants, description?, date? }} payload
 */
export const addExpense = (payload) =>
  request("/expenses", { method: "POST", body: payload });

/** Delete an expense by id. */
export const deleteExpense = (expenseId) =>
  request(`/expenses/${expenseId}`, { method: "DELETE" });
