import jwt from "jsonwebtoken";

const SESSION_SECRET = process.env.SESSION_SECRET as string | undefined;

if (!SESSION_SECRET) {
  console.warn("SESSION_SECRET is not set. Sessions and QR tokens will not be secure.");
}

export interface SessionTokenPayload {
  sub: string;
  email: string;
  name: string;
}

export function signSessionToken(payload: SessionTokenPayload): string {
  if (!SESSION_SECRET) throw new Error("SESSION_SECRET not configured");
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: "8h" });
}

export function verifySessionToken(token: string): SessionTokenPayload | null {
  if (!SESSION_SECRET) return null;
  try {
    return jwt.verify(token, SESSION_SECRET) as SessionTokenPayload;
  } catch {
    return null;
  }
}

export interface GuestQrTokenPayload {
  gid: string;
}

export function signGuestQrToken(payload: GuestQrTokenPayload): string {
  if (!SESSION_SECRET) throw new Error("SESSION_SECRET not configured");
  return jwt.sign(payload, SESSION_SECRET, { expiresIn: "72h" });
}

export function verifyGuestQrToken(token: string): GuestQrTokenPayload | null {
  if (!SESSION_SECRET) return null;
  try {
    return jwt.verify(token, SESSION_SECRET) as GuestQrTokenPayload;
  } catch {
    return null;
  }
}


