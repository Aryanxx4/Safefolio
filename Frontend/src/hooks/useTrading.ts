"use client";

import { useState, useCallback } from "react";
import { API_BASE_URL } from "@/utils/api";

export type OrderResponse = {
  success: boolean;
  order: {
    symbol: string;
    side: string;
    quantity: number;
    price: number;
    totalCost: number;
    executedAt: string;
  };
};

export type SimulationState = {
  id: number;
  name: string;
  current_date: string;
  start_date: string;
  end_date: string;
};

export function useTrading() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeOrder = useCallback(
    async (symbol: string, side: "BUY" | "SELL", quantity: number, mode: "historical" | "realtime") => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/trading/order`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ symbol, side, quantity, mode }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Order failed");
        }

        const data = (await res.json()) as OrderResponse;
        return data;
      } catch (err: any) {
        setError(err.message || "Failed to place order");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const advanceTime = useCallback(async (days: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/trading/advance`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to advance time");
      }

      return await res.json();
    } catch (err: any) {
      setError(err.message || "Failed to advance time");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSimulation = useCallback(async (mode: 'historical' | 'realtime' = 'historical') => {
    try {
      const res = await fetch(`${API_BASE_URL}/trading/simulation?mode=${mode}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to get simulation");
      const data = await res.json();
      return data.simulation as SimulationState | null;
    } catch (err) {
      console.error("Get simulation error", err);
      return null;
    }
  }, []);

  const getHistoricalPrices = useCallback(async (symbol: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/trading/historical/${symbol}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to get historical prices");
      return await res.json();
    } catch (err) {
      console.error("Get historical prices error", err);
      return null;
    }
  }, []);

  const getRealtimeQuote = useCallback(async (symbol: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/trading/realtime/${symbol}`, {
        credentials: "include",
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get real-time quote");
      }
      return await res.json();
    } catch (err: any) {
      console.error("Get real-time quote error", err);
      throw err; // Re-throw so the UI can display the error
    }
  }, []);

  return {
    placeOrder,
    advanceTime,
    getSimulation,
    getHistoricalPrices,
    getRealtimeQuote,
    loading,
    error,
  };
}
