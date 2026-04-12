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

  return { trip, expenses, balance, loading, error, refetch: fetchAll };
}
