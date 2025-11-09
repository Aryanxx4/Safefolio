"use client";

import Link from "next/link";
import { useStartPracticing } from "@/hooks/useStartPracticing";

export default function Hero() {
  const { start, loading } = useStartPracticing();

  return (
    <section className="relative overflow-hidden hero-gradient">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-20 md:grid-cols-2 md:py-28">
        <div>
          <h1 className="text-4xl font-bold md:text-5xl">
            Master the Market — Risk-Free
          </h1>
          <p className="mt-4 text-zinc-300">
            Learn trading, build strategies, and experience real market scenarios with virtual cash.
          </p>
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={start}
              disabled={loading}
              className="rounded bg-emerald-500/90 px-5 py-3 font-medium text-black shadow-emerald-500/40 transition-all hover:bg-emerald-400 hover:shadow-[0_0_24px_rgba(16,185,129,0.6)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Checking..." : "Start Practicing"}
            </button>
            <Link
              href="/concepts"
              className="rounded border border-emerald-400/60 px-5 py-3 font-medium text-emerald-300 hover:bg-emerald-400/10"
            >
              Learn Concepts
            </Link>
          </div>
        </div>
        <div className="relative">
          <svg viewBox="0 0 300 180" className="h-56 w-full text-emerald-400/80">
            <polyline
              className="chart-line"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              points="0,120 20,110 40,130 60,90 80,100 100,70 120,80 140,60 160,95 180,75 200,85 220,55 240,65 260,40 280,60 300,30"
            />
          </svg>
          <div className="pointer-events-none absolute -right-6 -top-3 h-8 w-8 rounded-full bg-emerald-400/20 blur-md float-slow" />
          <div className="pointer-events-none absolute bottom-6 left-6 h-10 w-10 rounded-full bg-teal-400/20 blur-md float-slower" />
        </div>
      </div>
    </section>
  );
}

