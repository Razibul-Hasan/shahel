import { NextResponse } from "next/server";
import { getPortfolio } from "@/lib/portfolio";

export const revalidate = 3600;

/** GET /api/portfolio: the photographer's portfolio as JSON (live from Pexels when a key is configured). */
export async function GET() {
  return NextResponse.json(await getPortfolio());
}
