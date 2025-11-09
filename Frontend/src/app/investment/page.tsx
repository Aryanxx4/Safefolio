"use client";

import { useState, useEffect, useMemo } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";
import { useTrading } from "@/hooks/useTrading";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { API_BASE_URL } from "@/utils/api";

const horizonOptions = [
  { label: "1 Year", value: 1 },
  { label: "5 Years", value: 5 },
  { label: "10 Years", value: 10 },
];

// Placeholder mutual funds with different returns
const MUTUAL_FUNDS = [
  { name: "BlueChip Equity Fund", code: "BCEF", annualReturn: 12.5, risk: "Moderate" },
  { name: "Growth Opportunities Fund", code: "GOF", annualReturn: 15.8, risk: "High" },
  { name: "Balanced Advantage Fund", code: "BAF", annualReturn: 10.2, risk: "Low" },
  { name: "Small Cap Growth Fund", code: "SCGF", annualReturn: 18.3, risk: "Very High" },
  { name: "Debt Plus Equity Fund", code: "DPEF", annualReturn: 9.5, risk: "Low" },
];

export default function InvestmentPage() {
  const { loading: authLoading } = useRequireAuth("/investment");
  const { summary } = usePortfolioSummary(!authLoading);
  const { getSimulation } = useTrading();
  const [horizon, setHorizon] = useState(5);
  const [selectedFund, setSelectedFund] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState(10000);
  const [simulation, setSimulation] = useState<any>(null);
  const [investmentDate, setInvestmentDate] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [investing, setInvesting] = useState(false);

  // Load simulation state (shared with trading page)
  useEffect(() => {
    if (!authLoading) {
      getSimulation("historical").then((sim) => {
        setSimulation(sim);
        if (sim?.current_date) {
          const dateStr = typeof sim.current_date === 'string' 
            ? sim.current_date 
            : new Date(sim.current_date).toISOString().split('T')[0];
          setInvestmentDate(dateStr);
        }
      });
    }
  }, [authLoading, getSimulation]);

  const selectedFundData = MUTUAL_FUNDS.find((f) => f.code === selectedFund);

  const handleInvest = async () => {
    if (!selectedFund || investmentAmount <= 0) {
      setMessage({ type: "error", text: "Please select a fund and enter an investment amount" });
      return;
    }

    if (investmentAmount > (summary?.totals.cash ?? 0)) {
      setMessage({ type: "error", text: "Insufficient balance for this investment" });
      return;
    }

    // Validate date for historical mode
    if (simulation && investmentDate) {
      const currentDate = new Date(simulation.current_date);
      const selectedDate = new Date(investmentDate);
      if (selectedDate < currentDate) {
        setMessage({ 
          type: "error", 
          text: `Cannot invest before current simulation date (${currentDate.toLocaleDateString("en-IN")}). Please advance time or select a date on or after the current date.` 
        });
        return;
      }
    }

    setInvesting(true);
    setMessage(null);

    try {
      // Simulate investment - in a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setMessage({ 
        type: "success", 
        text: `Successfully invested ₹${investmentAmount.toLocaleString("en-IN")} in ${selectedFundData?.name}` 
      });
      
      // Refresh portfolio after 1 second
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Investment failed" });
    } finally {
      setInvesting(false);
    }
  };

  // Calculate projected value based on selected fund and horizon
  const projectedValue = useMemo(() => {
    if (!selectedFundData || !investmentAmount) return null;
    const annualReturn = selectedFundData.annualReturn / 100;
    return investmentAmount * Math.pow(1 + annualReturn, horizon);
  }, [selectedFund, investmentAmount, horizon]);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-zinc-400">Loading investment workspace...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="text-3xl font-semibold">Investment Planner</h1>
      <p className="mt-2 text-zinc-400">
        Build diversified portfolios, simulate compounding, and align with long-term goals.
      </p>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <h2 className="text-lg font-semibold">Investment Controls</h2>
          
          <div className="space-y-3 text-sm">
            <label className="flex flex-col gap-1 text-zinc-300">
              Mutual Fund
              <select
                value={selectedFund}
                onChange={(e) => setSelectedFund(e.target.value)}
                className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a fund</option>
                {MUTUAL_FUNDS.map((fund) => (
                  <option key={fund.code} value={fund.code}>
                    {fund.name} ({fund.annualReturn}% p.a.)
                  </option>
                ))}
              </select>
            </label>

            {selectedFundData && (
              <div className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-2">
                <div className="text-xs text-zinc-400">Expected Annual Return</div>
                <div className="text-lg font-semibold text-blue-400">{selectedFundData.annualReturn}%</div>
                <div className="mt-1 text-xs text-zinc-500">Risk Level: {selectedFundData.risk}</div>
              </div>
            )}

            <label className="flex flex-col gap-1 text-zinc-300">
              Investment Amount
              <input
                type="number"
                min={1000}
                step={1000}
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1 text-zinc-300">
              Investment Date
              <input
                type="date"
                value={investmentDate}
                onChange={(e) => setInvestmentDate(e.target.value)}
                className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </label>

            {simulation && (
              <div className="rounded-lg border-2 border-blue-500/60 bg-blue-500/20 px-4 py-3">
                <div className="text-xs uppercase tracking-wide text-blue-300">Current Simulation Date</div>
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

            <div className="space-y-2">
              <label className="text-sm text-zinc-300">Investment Horizon</label>
              <div className="flex flex-wrap gap-2">
                {horizonOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setHorizon(option.value)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                      horizon === option.value 
                        ? "bg-blue-500 text-white" 
                        : "bg-slate-950 text-zinc-400 hover:text-white border border-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {projectedValue && selectedFundData && (
              <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2">
                <div className="text-xs text-zinc-400">Projected Value ({horizon} Year{horizon > 1 ? 's' : ''})</div>
                <div className="text-lg font-semibold text-emerald-400">
                  ₹{projectedValue.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  Expected return: ₹{(projectedValue - investmentAmount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                </div>
              </div>
            )}
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

          <button
            onClick={handleInvest}
            disabled={investing || !selectedFund || investmentAmount <= 0 || investmentAmount > (summary?.totals.cash ?? 0)}
            className="w-full rounded bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {investing ? "Processing..." : "Invest"}
          </button>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Available Balance</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              ₹{(summary?.totals.cash ?? 100000).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Projected Portfolio Value</h2>
              <p className="text-sm text-zinc-400">
                {selectedFundData 
                  ? `Assuming ${selectedFundData.annualReturn}% annual return for ${selectedFundData.name}`
                  : "Select a fund to see projections"}
              </p>
            </div>
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-300">Simulation</span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={Array.from({ length: horizon + 1 }).map((_, index) => {
                  const baseAmount = selectedFundData && investmentAmount > 0 
                    ? investmentAmount 
                    : (summary?.totals.totalValue ?? 100000);
                  const annualReturn = selectedFundData 
                    ? selectedFundData.annualReturn / 100 
                    : 0.10; // Default 10% if no fund selected
                  return {
                    year: `Year ${index}`,
                    value: Math.round(baseAmount * Math.pow(1 + annualReturn, index)),
                  };
                })}
              >
                <defs>
                  <linearGradient id="investment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="year" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 12 }}
                  formatter={(value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                />
                <Area type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={2} fill="url(#investment)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm text-zinc-300">
            <p className="text-xs uppercase tracking-wide text-zinc-500">Action Items</p>
            <ul className="mt-3 space-y-2">
              <li className="flex items-center justify-between">
                <span>Review asset allocation</span>
                <span className="text-emerald-400">Upcoming</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Set SIP reminder</span>
                <span className="text-blue-400">Planned</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Backtest strategy</span>
                <span className="text-orange-400">In-progress</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

