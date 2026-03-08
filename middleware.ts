import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "./lib/auth/jwt";

const PUBLIC_PATHS = ["/login", "/manifest.json", "/sw.js", "/favicon.ico", "/icons", "/api/guests/verify", "/api/guests/qr"];

function isPublicPath(pathname: string) {
  return (
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/api/auth")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Temporary bypass for testing
  return NextResponse.next();

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("ftour_session")?.value;
  const valid = token && verifySessionToken(token as string);

  if (!valid) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", (pathname as any) || "/");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|images|favicon.ico).*)"]
};


