// hooks/useTrip.js
// Fetches trip info, expenses, and balance in one hook.
// Components that need trip data import this — no prop drilling.

import { useState, useEffect, useCallback } from 'react';
import { getTrip, getTripExpenses, getTripBalance } from '../api';

export function useTrip(tripId) {
  const [trip, setTrip]           = useState(null);
  const [expenses, setExpenses]   = useState([]);
  const [balance, setBalance]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  const fetchAll = useCallback(async () => {
    if (!tripId) return;
    setLoading(true);
    setError(null);
    try {
      const [tripData, expenseData, balanceData] = await Promise.all([
        getTrip(tripId),
        getTripExpenses(tripId),
        getTripBalance(tripId),
      ]);
      setTrip(tripData);
      setExpenses(expenseData);
      setBalance(balanceData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const refetchBalance = useCallback(async () => {
    if (!tripId) return;
    try {
      setBalance(await getTripBalance(tripId));
    } catch (err) {
      setError(err.message);
    }
  }, [tripId]);

  const addExpenseLocal = useCallback((expense) => {
    setExpenses((prev) => [...prev, expense]);
    refetchBalance();
  }, [refetchBalance]);

  const updateExpenseLocal = useCallback((expense) => {
    setExpenses((prev) => prev.map((e) => (e._id === expense._id ? expense : e)));
    refetchBalance();
  }, [refetchBalance]);

  const removeExpenseLocal = useCallback((expenseId) => {
    setExpenses((prev) => prev.filter((e) => e._id !== expenseId));
    refetchBalance();
  }, [refetchBalance]);

  return {
    trip,
    expenses,
    balance,
    loading,
    error,
    refetch: fetchAll,
    addExpenseLocal,
    updateExpenseLocal,
    removeExpenseLocal,
  };
}
