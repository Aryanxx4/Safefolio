"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const eraInfo: Record<number, { label: string; desc: string; color: string }> = {
  2007: { label: "Pre-Crisis", desc: "Bull market before crash", color: "emerald" },
  2008: { label: "Financial Crisis", desc: "Market crash & recovery", color: "red" },
  2020: { label: "Pandemic Crash", desc: "COVID-19 market volatility", color: "orange" },
  2021: { label: "Bull Run", desc: "Recovery & growth", color: "emerald" },
};

export default function Preview() {
  const [era, setEra] = useState(2008);
  const currentEra = eraInfo[era] || eraInfo[2008];

  // Animated portfolio value
  const [portfolioValue, setPortfolioValue] = useState(100000);

  useEffect(() => {
    const base = era === 2008 ? 95000 : era === 2020 ? 98000 : 105000;
    const interval = setInterval(() => {
      setPortfolioValue((prev) => base + Math.floor(Math.random() * 5000));
    }, 2000);
    return () => clearInterval(interval);
  }, [era]);

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20">
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-6 shadow-xl">
        <div className="mb-6">
          <h2 className="text-3xl font-semibold">Interactive Preview</h2>
          <p className="mt-2 text-zinc-300">
            See how you would've performed in past markets. Move the slider to explore different eras.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Mock Simulator UI - Chart & Portfolio */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mini Portfolio Panel */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-zinc-400">Portfolio Value</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    ${portfolioValue.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-zinc-400">PnL</div>
                  <div className={`text-lg font-semibold ${portfolioValue > 100000 ? "text-emerald-400" : "text-red-400"}`}>
                    {portfolioValue > 100000 ? "+" : ""}
                    {(portfolioValue - 100000).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Chart */}
            <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">AAPL - {era}</span>
                <span className="text-xs text-zinc-400">{currentEra.label}</span>
              </div>
              <svg viewBox="0 0 300 120" className="h-40 w-full text-emerald-400/80">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  points={
                    era === 2008
                      ? "0,100 30,90 60,110 90,85 120,95 150,75 180,85 210,65 240,80 270,60 300,40"
                      : era === 2020
                      ? "0,80 30,100 60,85 90,110 120,90 150,100 180,75 210,85 240,70 270,60 300,50"
                      : "0,120 30,110 60,100 90,85 120,75 150,65 180,55 210,45 240,35 270,25 300,20"
                  }
                  className="chart-line"
                />
              </svg>
              <div className="mt-2 flex items-center gap-4 text-xs text-zinc-400">
                <span>Open: $45.20</span>
                <span>High: $47.80</span>
                <span>Low: $44.10</span>
                <span className="text-emerald-400">Close: $46.50</span>
              </div>
            </div>
          </div>

          {/* Time Machine Slider */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-5">
            <div className="mb-4">
              <div className="text-sm font-medium text-zinc-300">Time Machine</div>
              <div className="mt-1 text-xs text-zinc-400">{currentEra.desc}</div>
            </div>
            <input
              type="range"
              min={2007}
              max={2021}
              step={1}
              value={era}
              onChange={(e) => setEra(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500"
            />
            <div className="mt-4 space-y-2 text-xs">
              {Object.entries(eraInfo).map(([year, info]) => (
                <div
                  key={year}
                  className={`flex items-center justify-between rounded px-2 py-1 ${
                    parseInt(year) === era ? "bg-emerald-500/20 text-emerald-300" : "text-zinc-400"
                  }`}
                >
                  <span>{year}</span>
                  <span>{info.label}</span>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard"
              className="mt-6 block w-full rounded bg-emerald-500/90 px-4 py-2 text-center text-sm font-medium text-black hover:bg-emerald-400 transition-colors"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

