import { NextResponse } from "next/server";
import { getTopCoins } from "@/lib/coingecko";

export async function GET() {
  try {
    const coins = await getTopCoins();
    return NextResponse.json(coins);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
