"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/utils/api";

export type AllocationSlice = {
  symbol: string;
  value: number;
};

export type PositionSummary = {
  symbol: string;
  quantity: number;
  averagePrice: number;
  marketValue: number;
};

export type TransactionSummary = {
  id: number;
  symbol: string;
  side: string;
  quantity: number;
  price: number;
  executedAt: string;
};

export type PortfolioSummary = {
  user: {
    id: number;
    name?: string;
    email?: string;
    picture?: string;
    balance: number;
  };
  totals: {
    cash: number;
    invested: number;
    totalValue: number;
  };
  positions: PositionSummary[];
  allocation: AllocationSlice[];
  transactions: TransactionSummary[];
  equityCurve: { label: string; value: number }[];
};

export function usePortfolioSummary(enabled: boolean) {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/portfolio/summary`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error(`Failed to load portfolio summary (${res.status})`);
        }
        const data = (await res.json()) as PortfolioSummary;
        if (mounted) {
          setSummary(data);
        }
      } catch (err) {
        console.error("Failed to load portfolio summary", err);
        if (mounted) {
          setError("Unable to load portfolio summary");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchSummary();
    return () => {
      mounted = false;
    };
  }, [enabled]);

  return { summary, loading, error };
}
