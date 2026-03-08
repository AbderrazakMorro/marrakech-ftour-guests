import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  clearSessionCookie();
  const url = new URL(req.url);
  const loginUrl = new URL("/login", url.origin);
  return NextResponse.redirect(loginUrl);
}


