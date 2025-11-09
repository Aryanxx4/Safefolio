import { NextResponse } from "next/server";

// Minimal static price sample for placeholder chart
const sample = [
  { date: "2007-01-02", open: 100, high: 102, low: 99, close: 101, volume: 1000000 },
  { date: "2007-01-03", open: 101, high: 103, low: 100, close: 102, volume: 1200000 },
  { date: "2007-01-04", open: 102, high: 104, low: 101, close: 103, volume: 900000 },
];

export async function GET() {
  return NextResponse.json({ prices: sample });
}

