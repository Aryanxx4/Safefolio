"use client";
import { useState } from "react";

export default function TradePage() {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState<number>(0);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h2 className="text-2xl font-semibold">Place Order</h2>
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-zinc-300">Symbol</label>
          <input
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="AAPL"
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-300">Quantity</label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value || "0", 10))}
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm text-zinc-300">Side</label>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as any)}
            className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2"
          >
            <option value="BUY">BUY</option>
            <option value="SELL">SELL</option>
          </select>
        </div>
        <button className="mt-4 w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500">
          Submit (mock)
        </button>
      </div>
    </div>
  );
}

