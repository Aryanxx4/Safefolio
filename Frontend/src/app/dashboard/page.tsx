"use client";

import { useMemo } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { usePortfolioSummary } from "@/hooks/usePortfolioSummary";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";

// High contrast colors that work well on dark backgrounds
const PIE_COLORS = [
  "#3b82f6", // Blue for Cash
  "#f59e0b", // Amber for first stock
  "#ef4444", // Red for second stock
  "#8b5cf6", // Purple for third stock
  "#ec4899", // Pink for fourth stock
  "#06b6d4", // Cyan for fifth stock
  "#f97316", // Orange for sixth stock
  "#14b8a6", // Teal for seventh stock
];

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth("/dashboard");
  const { summary, loading: summaryLoading } = usePortfolioSummary(!authLoading);

  const allocationData = useMemo(() => {
    if (!summary?.allocation?.length) {
      return [{ symbol: "Cash", value: summary?.totals.cash ?? 0 }];
    }
    // Filter out zero values and ensure cash is first
    const filtered = summary.allocation.filter((item) => item.value > 0);
    // Sort to put Cash first, then others
    return filtered.sort((a, b) => {
      if (a.symbol === "Cash") return -1;
      if (b.symbol === "Cash") return 1;
      return 0;
    });
  }, [summary]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-zinc-400">Checking session...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-semibold">Welcome back{user.name ? `, ${user.name.split(" ")[0]}!` : "!"}</h2>
          <p className="mt-2 text-zinc-400">Track your practice capital, positions, and recent activity.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/trading"
            className="rounded bg-emerald-500/90 px-5 py-2 text-sm font-medium text-black hover:bg-emerald-400"
          >
            Go to Trading Desk
          </Link>
          <Link
            href="/investment"
            className="rounded bg-blue-500/90 px-5 py-2 text-sm font-medium text-white hover:bg-blue-400"
          >
            Go to Investment Desk
          </Link>
        </div>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <p className="text-sm text-zinc-400">Cash Balance</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-400">
            ₹{(summary?.totals.cash ?? user.balance).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Initial demo capital: ₹100,000</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <p className="text-sm text-zinc-400">Invested Capital</p>
          <p className="mt-3 text-3xl font-semibold text-emerald-300">
            ₹{(summary?.totals.invested ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Across open positions</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <p className="text-sm text-zinc-400">Total Equity</p>
          <p className="mt-3 text-3xl font-semibold text-white">
            ₹{(summary?.totals.totalValue ?? user.balance).toLocaleString("en-IN", { maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Cash + Investments</p>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <h3 className="text-lg font-semibold">Equity Curve</h3>
          <p className="text-sm text-zinc-400">Performance of your simulated portfolio</p>
          <div className="mt-6 h-64">
            {summaryLoading ? (
              <div className="flex h-full items-center justify-center text-zinc-500">Loading chart...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={summary?.equityCurve ?? []}>
                  <defs>
                    <linearGradient id="equity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                  <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f172a", border: "1px solid #1f2937", borderRadius: 12 }}
                    formatter={(value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#equity)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow">
          <h3 className="text-lg font-semibold">Asset Allocation</h3>
          <p className="text-sm text-zinc-400">Distribution across holdings</p>
          <div className="mt-4 flex h-64 flex-col justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  nameKey="symbol"
                  data={allocationData}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={entry.symbol} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `₹${(value as number).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`,
                    name,
                  ]}
                  contentStyle={{ 
                    background: "#ffffff", 
                    borderRadius: 12, 
                    border: "2px solid #3b82f6",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
                    padding: "12px 16px"
                  }}
                  labelStyle={{ 
                    color: "#1e293b", 
                    fontWeight: 600,
                    fontSize: "14px"
                  }}
                  itemStyle={{ 
                    color: "#1e293b",
                    fontSize: "13px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-zinc-400">
              {allocationData.map((slice, idx) => (
                <div key={slice.symbol} className="flex items-center gap-2">
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                  />
                  {slice.symbol}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
            <h3 className="text-lg font-semibold">Open Positions</h3>
            <span className="text-xs text-zinc-500">{summary?.positions.length ?? 0} holdings</span>
          </div>
          <div className="max-h-80 overflow-y-auto px-5 py-3 text-sm">
            {summaryLoading ? (
              <p className="text-zinc-500">Loading positions...</p>
            ) : summary && summary.positions.length > 0 ? (
              <table className="w-full">
                <thead className="text-left text-xs uppercase tracking-wide text-zinc-500">
                  <tr>
                    <th className="py-2">Symbol</th>
                    <th className="py-2">Qty</th>
                    <th className="py-2">Avg Price</th>
                    <th className="py-2">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-zinc-200">
                  {summary.positions.map((pos) => (
                    <tr key={pos.symbol}>
                      <td className="py-2 font-medium text-white">{pos.symbol}</td>
                      <td className="py-2">{pos.quantity}</td>
                      <td className="py-2">₹{pos.averagePrice.toFixed(2)}</td>
                      <td className="py-2 text-emerald-400">₹{pos.marketValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-zinc-500">No open positions yet. Place your first trade on the trading desk.</p>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow">
          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <span className="text-xs text-zinc-500">Latest 10 trades</span>
          </div>
          <div className="max-h-80 overflow-y-auto px-5 py-3 text-sm">
            {summaryLoading ? (
              <p className="text-zinc-500">Loading activity...</p>
            ) : summary && summary.transactions.length > 0 ? (
              <ul className="space-y-3">
                {summary.transactions.map((txn) => (
                  <li key={txn.id} className="flex items-center justify-between border-b border-slate-800/60 pb-2 last:border-none">
                    <div>
                      <p className="font-medium text-white">
                        {txn.side === "BUY" ? (
                          <span className="text-emerald-400">Bought</span>
                        ) : (
                          <span className="text-red-400">Sold</span>
                        )} {txn.quantity} {txn.symbol}
                      </p>
                      <p className="text-xs text-zinc-500">₹{txn.price.toFixed(2)} • {new Date(txn.executedAt).toLocaleString()}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500">No trades yet. Your activity will appear here after you place orders.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

