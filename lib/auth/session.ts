import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { signSessionToken, verifySessionToken, SessionTokenPayload } from "./jwt";

const SESSION_COOKIE_NAME = "ftour_session";

export function getSessionFromRequest():
  | (SessionTokenPayload & { token: string })
  | null {
  const store = cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = verifySessionToken(token as string);
  if (!payload) return null;
  return { ...payload, token: token as string } as any;
}

export async function getSession(request: NextRequest): Promise<SessionTokenPayload | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token as string);
}

export function createSessionCookie(payload: SessionTokenPayload) {
  const token = signSessionToken(payload);
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8 // 8 hours
  } as any);
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}
