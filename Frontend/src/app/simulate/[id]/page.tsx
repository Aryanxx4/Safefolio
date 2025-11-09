"use client";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function SimulationPage() {
  const params = useParams<{ id: string }>();
  const simId = decodeURIComponent(params.id);

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Simulation: {simId}</h2>
        <div className="flex gap-3">
          <button className="rounded bg-zinc-800 px-3 py-2 hover:bg-zinc-700">
            Advance Day
          </button>
          <Link
            href="/trade"
            className="rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500"
          >
            New Trade
          </Link>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="col-span-2 rounded border border-zinc-800 p-4">
          <div className="h-64 w-full rounded bg-zinc-900" />
          <p className="mt-2 text-sm text-zinc-400">Chart placeholder</p>
        </div>
        <div className="rounded border border-zinc-800 p-4">
          <h3 className="text-lg font-medium">Portfolio</h3>
          <div className="mt-3 text-zinc-300">Cash: $100,000</div>
          <div className="mt-1 text-zinc-300">Equity: $100,000</div>
          <div className="mt-1 text-zinc-300">PnL: $0</div>
        </div>
      </div>
    </div>
  );
}

