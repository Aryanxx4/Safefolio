"use client";

import { useMemo, useState, useEffect } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";
import { useTrading } from "@/hooks/useTrading";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  Tooltip,
} from "recharts";

const TAB_CONFIG = [
  { id: "historical", label: "Historical Simulation" },
  { id: "realtime", label: "Real-Time Practice" },
];

export default function TradingPage() {
  const { loading: authLoading } = useRequireAuth("/trading");
  const { summary, loading: summaryLoading } = usePortfolioSummary(!authLoading);
  const { placeOrder, advanceTime, getSimulation, getHistoricalPrices, getRealtimeQuote, loading: tradingLoading, error: tradingError } = useTrading();
  const [advanceLoading, setAdvanceLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<string>("historical");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [historicalDate, setHistoricalDate] = useState("2010-01-01");
  const [simulation, setSimulation] = useState<any>(null);
  const [historicalPrices, setHistoricalPrices] = useState<any[]>([]);
  const [realtimeQuote, setRealtimeQuote] = useState<any>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [stockSymbols, setStockSymbols] = useState<string[]>([]);
  const [symbolsLoading, setSymbolsLoading] = useState(false);
  const [selectedStockPrice, setSelectedStockPrice] = useState<number | null>(null);

  // Load stock symbols
  useEffect(() => {
    if (!authLoading) {
      setSymbolsLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/trading/symbols`, {
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

  // Load simulation state based on active tab
  useEffect(() => {
    if (!authLoading) {
      const mode = activeTab === "historical" ? "historical" : "realtime";
      getSimulation(mode).then(setSimulation);
    }
  }, [authLoading, activeTab, getSimulation]);

  // Fetch current price when symbol is selected
  useEffect(() => {
    if (symbol && !authLoading) {
      const mode = activeTab === "historical" ? "historical" : "realtime";
      fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/trading/price/${symbol}?mode=${mode}`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.price) {
            setSelectedStockPrice(data.price);
          } else {
            setSelectedStockPrice(null);
          }
        })
        .catch(() => {
          setSelectedStockPrice(null);
        });
    } else {
      setSelectedStockPrice(null);
    }
  }, [symbol, activeTab, authLoading]);

  // Load historical prices when symbol or simulation changes (for chart)
  useEffect(() => {
    if (activeTab === "historical" && symbol && !authLoading && simulation) {
      getHistoricalPrices(symbol).then((data) => {
        if (data?.prices) {
          setHistoricalPrices(data.prices);
          if (data.currentDate) {
            setHistoricalDate(data.currentDate);
          }
        }
      });
    }
  }, [activeTab, symbol, authLoading, simulation, getHistoricalPrices]);

  // Load real-time quote when in real-time mode
  useEffect(() => {
    if (activeTab === "realtime" && symbol && !authLoading) {
      const fetchQuote = async () => {
        try {
          const quote = await getRealtimeQuote(symbol);
          setRealtimeQuote(quote);
          setSelectedStockPrice(quote?.price || null);
          setMessage(null); // Clear any previous errors
        } catch (err: any) {
          setRealtimeQuote(null);
          setSelectedStockPrice(null);
          setMessage({ 
            type: "error", 
            text: err.message || `Unable to fetch real-time price for ${symbol}. Try using Historical Simulation mode instead.` 
          });
        }
      };
      
      fetchQuote();
      const interval = setInterval(fetchQuote, 5000);
      return () => clearInterval(interval);
    } else {
      setRealtimeQuote(null);
      if (activeTab !== "realtime") {
        setMessage(null);
      }
    }
  }, [activeTab, symbol, authLoading, getRealtimeQuote]);

  const handleBuy = async () => {
    try {
      setMessage(null);
      // Validate date for historical mode
      if (activeTab === "historical" && simulation) {
        const currentDate = new Date(simulation.current_date);
        const selectedDate = new Date(historicalDate);
        if (selectedDate < currentDate) {
          setMessage({ 
            type: "error", 
            text: `Cannot buy before current simulation date (${currentDate.toLocaleDateString("en-IN")}). Please advance time or select a date on or after the current date.` 
          });
          return;
        }
      }
      const result = await placeOrder(symbol, "BUY", quantity, activeTab === "historical" ? "historical" : "realtime");
      setMessage({ type: "success", text: `Bought ${quantity} ${symbol} at ₹${result.order.price.toFixed(2)}` });
      // Refresh portfolio
      window.location.reload();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Buy order failed" });
    }
  };

  const handleSell = async () => {
    try {
      setMessage(null);
      const result = await placeOrder(symbol, "SELL", quantity, activeTab === "historical" ? "historical" : "realtime");
      setMessage({ type: "success", text: `Sold ${quantity} ${symbol} at ₹${result.order.price.toFixed(2)}` });
      // Refresh portfolio
      window.location.reload();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Sell order failed" });
    }
  };

  const handleAdvance = async (days: number) => {
    try {
      setMessage(null);
      setAdvanceLoading(true);

      // Step 1: Advance time
      await advanceTime(days);
      
      // Step 2: Get updated simulation state
      const updated = await getSimulation("historical");
      if (updated) {
        setSimulation(updated);
        setHistoricalDate(updated.current_date);
      }

      // Step 3: Update prices and calculate changes
      if (symbol) {
        const data = await getHistoricalPrices(symbol);
        if (data?.prices && data.prices.length >= 2) {
          setHistoricalPrices(data.prices);
          
          // Get last two prices to calculate change
          const oldPrice = data.prices[data.prices.length - 2]?.close;
          const newPrice = data.prices[data.prices.length - 1]?.close;
          
          if (oldPrice && newPrice) {
            const change = newPrice - oldPrice;
            const changePercent = (change / oldPrice) * 100;
            const changeText = change >= 0 ? "increased" : "decreased";
            const color = change >= 0 ? "text-emerald-400" : "text-red-400";
            
            setMessage({ 
              type: "success", 
              text: `${symbol} ${changeText} by ₹${Math.abs(change).toFixed(2)} (${changePercent.toFixed(2)}%) after advancing ${days} days`
            });

            // Update the price display immediately
            setSelectedStockPrice(newPrice);
          }
        }
      }

      // Step 4: Refresh portfolio summary
      const portfolioRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/portfolio/summary`, 
        {
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        }
      );
      
      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json();
        if (portfolioData) {
          // This will update the portfolio value chart
          summary?.equityCurve?.push({
            label: new Date(updated?.current_date || '').toLocaleDateString("en-IN", { 
              month: "short", 
              day: "numeric" 
            }),
            value: portfolioData.totals.totalValue
          });
        }
      }

      setAdvanceLoading(false);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to advance time" });
      setAdvanceLoading(false);
    }
  };

  const chartData = useMemo(() => {
    if (activeTab === "historical" && historicalPrices.length > 0) {
      return historicalPrices.map((p) => ({
        name: new Date(p.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        value: p.close,
      }));
    }
    if (!summary?.equityCurve) return [];
    return summary.equityCurve.map((point, idx) => ({
      name: point.label || `T${idx}`,
      value: point.value,
    }));
  }, [summary, historicalPrices, activeTab]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-zinc-400">Loading trading desk...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Trading Desk</h1>
          <p className="mt-2 text-zinc-400">Simulate market strategies using historical data or practice with live feeds.</p>
        </div>
        <div className="flex gap-3 rounded-full border border-slate-800 bg-slate-900/60 p-1">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === tab.id ? "bg-emerald-500 text-black" : "text-zinc-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "historical" ? (
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow">
            <h2 className="text-lg font-semibold">Simulation Controls</h2>
            <div className="space-y-3 text-sm">
              <label className="flex flex-col gap-1 text-zinc-300">
                Stock
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  disabled={symbolsLoading}
                >
                  {symbolsLoading ? (
                    <option>Loading symbols...</option>
                  ) : (
                    <>
                      <option value="">Select a symbol</option>
                      {stockSymbols.map((sym) => (
                        <option key={sym} value={sym}>
                          {sym}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </label>
              {selectedStockPrice && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
                  <div className="text-xs text-zinc-400">Current Price</div>
                  <div className="text-lg font-semibold text-emerald-400">₹{selectedStockPrice.toFixed(2)}</div>
                </div>
              )}
              <label className="flex flex-col gap-1 text-zinc-300">
                Quantity
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-zinc-300">
                Start Date
                <input
                  type="date"
                  value={historicalDate}
                  onChange={(e) => setHistoricalDate(e.target.value)}
                  className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </label>
            </div>
            {message && (
              <div className={`rounded-lg border px-3 py-2 text-sm ${
                message.type === "success" 
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" 
                  : "border-red-500/40 bg-red-500/10 text-red-300"
              }`}>
                {message.text}
              </div>
            )}
            {simulation && (
              <div className="rounded-lg border-2 border-emerald-500/60 bg-emerald-500/20 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-emerald-300">Current Simulation Date</div>
                <div className="mt-1 text-xl font-bold text-white">
                  {new Date(simulation.current_date).toLocaleDateString("en-IN", { 
                    weekday: "long", 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Advance 1 Week", days: 7 },
                { label: "Advance 1 Month", days: 30 },
                { label: "Advance 3 Months", days: 90 },
                { label: "Advance 1 Year", days: 365 },
              ].map((control) => (
                <button
                  key={control.label}
                  onClick={() => handleAdvance(control.days)}
                  disabled={tradingLoading || advanceLoading}
                  className="rounded-lg border border-emerald-500/40 bg-slate-950 px-3 py-2 text-xs font-medium uppercase tracking-wide text-emerald-300 transition hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {advanceLoading ? "Advancing..." : control.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3 text-sm">
              <button
                onClick={handleBuy}
                disabled={tradingLoading || !symbol || quantity <= 0}
                className="flex-1 rounded bg-emerald-500 px-4 py-2 font-medium text-black transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tradingLoading ? "Processing..." : "Buy"}
              </button>
              <button
                onClick={handleSell}
                disabled={tradingLoading || !symbol || quantity <= 0}
                className="flex-1 rounded bg-red-500/90 px-4 py-2 font-medium text-black transition hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tradingLoading ? "Processing..." : "Sell"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Price Simulation</h3>
                  <p className="text-sm text-zinc-400">
                    {symbol} • {simulation ? new Date(simulation.current_date).toLocaleDateString("en-IN") : historicalDate}
                    {historicalPrices.length > 0 && (
                      <span className="ml-2 text-emerald-400">
                        ₹{historicalPrices[historicalPrices.length - 1]?.close?.toFixed(2) || "N/A"}
                      </span>
                    )}
                  </p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Historical Mode</span>
              </div>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="name" stroke="#94a3b8" tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 12 }}
                      formatter={(value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                    />
                    <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow">
              <h3 className="text-lg font-semibold">Trade Ideas & Notes</h3>
              <textarea
                className="mt-3 h-32 w-full resize-none rounded-lg border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                placeholder="Capture why you entered the trade, risk levels, exit plan, etc."
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow lg:col-span-1">
            <h2 className="text-lg font-semibold">Live Practice</h2>
            <p className="text-sm text-zinc-400">
              Live quotes powered by Finnhub (coming soon). Configure your watchlist and prepare orders.
            </p>
            <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm text-zinc-300">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Watchlist</p>
              <div className="mt-3 space-y-2">
                {["AAPL", "INFY", "TSLA", "RELIANCE"].map((ticker) => (
                  <div key={ticker} className="flex items-center justify-between">
                    <span>{ticker}</span>
                    <span className="text-emerald-400">
                      {activeTab === "realtime" ? "Live" : "—"}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-zinc-500">
                {activeTab === "realtime" ? "Live prices update every 5 seconds for selected symbol" : "Switch to Real-Time mode to see live prices"}
              </p>
            </div>
            <div>
              <label className="text-sm text-zinc-300">Stock</label>
              <select
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                disabled={symbolsLoading}
              >
                {symbolsLoading ? (
                  <option>Loading symbols...</option>
                ) : (
                  <>
                    <option value="">Select a symbol</option>
                    {stockSymbols.map((sym) => (
                      <option key={sym} value={sym}>
                        {sym}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
            {selectedStockPrice && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
                <div className="text-xs text-zinc-400">Current Price</div>
                <div className="text-lg font-semibold text-emerald-400">₹{selectedStockPrice.toFixed(2)}</div>
              </div>
            )}
            <div>
              <label className="text-sm text-zinc-300">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            {realtimeQuote && (
              <div className="rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Current Price</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-400">₹{realtimeQuote.price?.toFixed(2) || "N/A"}</p>
                <p className={`mt-1 text-xs ${(realtimeQuote.changePercent || 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {realtimeQuote.changePercent >= 0 ? "+" : ""}
                  {realtimeQuote.changePercent?.toFixed(2)}% ({realtimeQuote.change >= 0 ? "+" : ""}₹{realtimeQuote.change?.toFixed(2)})
                </p>
              </div>
            )}
            {message && (
              <div className={`rounded-lg border px-3 py-2 text-sm ${
                message.type === "success" 
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" 
                  : "border-red-500/40 bg-red-500/10 text-red-300"
              }`}>
                {message.text}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleBuy}
                disabled={tradingLoading || !symbol || quantity <= 0}
                className="flex-1 rounded bg-emerald-500 px-4 py-2 text-sm font-medium text-black transition hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tradingLoading ? "Processing..." : "Buy at Market"}
              </button>
              <button
                onClick={handleSell}
                disabled={tradingLoading || !symbol || quantity <= 0}
                className="flex-1 rounded bg-red-500/90 px-4 py-2 text-sm font-medium text-black transition hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tradingLoading ? "Processing..." : "Sell at Market"}
              </button>
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow lg:col-span-2">
            <h3 className="text-lg font-semibold">Live Price Action</h3>
            <div className="h-72 rounded-xl border border-slate-800 bg-slate-950/70">
              <div className="flex h-full items-center justify-center text-sm text-zinc-600">
                Real-time chart to be rendered when live data is enabled.
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Order Book</p>
                <p className="mt-2 text-sm text-zinc-400">Add level-II depth once available.</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
                <p className="text-xs uppercase tracking-wide text-zinc-500">News Pulse</p>
                <p className="mt-2 text-sm text-zinc-400">Streaming relevant news updates will appear here.</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

