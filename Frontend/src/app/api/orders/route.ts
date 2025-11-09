import { NextResponse } from "next/server";

const orders: any[] = [];

export async function GET() {
  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const order = {
    id: `${Date.now()}`,
    symbol: body.symbol,
    side: body.side,
    qty: Number(body.qty) || 0,
    status: "PENDING",
    placedAt: new Date().toISOString(),
  };
  orders.push(order);
  return NextResponse.json(order, { status: 201 });
}

