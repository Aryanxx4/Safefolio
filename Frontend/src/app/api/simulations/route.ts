import { NextResponse } from "next/server";

// In-memory mock store (per server instance)
const sims: any[] = [];

export async function GET() {
  return NextResponse.json({ simulations: sims });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = body?.name || `sim-${Date.now()}`;
  const sim = {
    id: name,
    name,
    currentDate: "2007-01-02",
    startingCash: 100_000,
  };
  sims.push(sim);
  return NextResponse.json(sim, { status: 201 });
}

