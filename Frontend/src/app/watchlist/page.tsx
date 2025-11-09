"use client";

import { useState, useEffect } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { API_BASE_URL } from "@/utils/api";

type WatchlistItem = {
  symbol: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  priceDate: string | null;
  mode: string | null;
  addedAt: string;
};

export default function WatchlistPage() {
  const { user, loading: authLoading } = useRequireAuth("/watchlist");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [symbolsLoading, setSymbolsLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [adding, setAdding] = useState(false);
  const [mode, setMode] = useState<"historical" | "realtime">("historical");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load stock symbols
  useEffect(() => {
    if (!authLoading) {
      setSymbolsLoading(true);
      fetch(`${API_BASE_URL}/trading/symbols`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.symbols) {
            setStockSymbols(data.symbols);
          }
        })
        .catch((err) => {
          console.error("Failed to load symbols", err);
        })
        .finally(() => setSymbolsLoading(false));
    }
  }, [authLoading]);

  // Load watchlist
  const loadWatchlist = async () => {
    if (authLoading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/watchlist?mode=${mode}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      if (data.watchlist) {
        setWatchlist(data.watchlist);
      }
    } catch (err) {
      console.error("Failed to load watchlist", err);
      setMessage({ type: "error", text: "Failed to load watchlist" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadWatchlist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, mode]);

  // Auto-refresh watchlist in real-time mode
  useEffect(() => {
    if (mode === "realtime" && !authLoading) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/watchlist?mode=realtime`, {
            credentials: "include",
            headers: { Accept: "application/json" },
          });
          const data = await res.json();
          if (data.watchlist) {
            setWatchlist(data.watchlist);
          }
        } catch (err) {
          console.error("Failed to refresh watchlist", err);
        }
      }, 10000); // Refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [mode, authLoading]);

  // Add stock to watchlist
  const handleAdd = async () => {
    if (!selectedSymbol) {
      setMessage({ type: "error", text: "Please select a stock" });
      return;
    }

    setAdding(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE_URL}/watchlist/add`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ symbol: selectedSymbol }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Added ${selectedSymbol} to watchlist` });
        setSelectedSymbol("");
        loadWatchlist();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to add stock" });
      }
    } catch (err) {
      console.error("Failed to add stock", err);
      setMessage({ type: "error", text: "Failed to add stock to watchlist" });
    } finally {
      setAdding(false);
    }
  };

  // Remove stock from watchlist
  const handleRemove = async (symbol: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/watchlist/remove/${symbol}`, {
        method: "DELETE",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Removed ${symbol} from watchlist` });
        loadWatchlist();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to remove stock" });
      }
    } catch (err) {
      console.error("Failed to remove stock", err);
      setMessage({ type: "error", text: "Failed to remove stock from watchlist" });
    }
  };

  // Format price
  const formatPrice = (price: number | null) => {
    if (price === null) return "N/A";
    return `₹${price.toFixed(2)}`;
  };

  // Format change
  const formatChange = (change: number | null, changePercent: number | null) => {
    if (change === null || changePercent === null) return null;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)} (${sign}${changePercent.toFixed(2)}%)`;
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Watchlist</h1>
          <p className="mt-2 text-zinc-400">Track prices of stocks you're interested in</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode("historical")}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              mode === "historical"
                ? "bg-emerald-500/90 text-black"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Historical
          </button>
          <button
            onClick={() => setMode("realtime")}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              mode === "realtime"
                ? "bg-emerald-500/90 text-black"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
            }`}
          >
            Real-Time
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 rounded px-4 py-3 ${
            message.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Add Stock Section */}
      <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="mb-4 text-lg font-medium">Add Stock to Watchlist</h2>
        <div className="flex gap-3">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            disabled={symbolsLoading || adding}
            className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-4 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          >
            <option value="">Select a stock...</option>
            {stockSymbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedSymbol || adding || symbolsLoading}
            className="rounded bg-emerald-500/90 px-6 py-2 font-medium text-black hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* Watchlist Table */}
      {watchlist.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-zinc-400">Your watchlist is empty. Add stocks to track their prices.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">Symbol</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">Price</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">Change</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">
                  {mode === "historical" ? "Date" : "Last Updated"}
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((item) => {
                const change = formatChange(item.change, item.changePercent);
                const isPositive = item.change !== null && item.change >= 0;
                return (
                  <tr key={item.symbol} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-6 py-4 font-medium">{item.symbol}</td>
                    <td className="px-6 py-4">{formatPrice(item.price)}</td>
                    <td className={`px-6 py-4 ${change ? (isPositive ? "text-emerald-400" : "text-red-400") : "text-zinc-500"}`}>
                      {change || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {item.priceDate
                        ? new Date(item.priceDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRemove(item.symbol)}
                        className="rounded bg-red-500/20 px-3 py-1 text-sm text-red-400 hover:bg-red-500/30"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
