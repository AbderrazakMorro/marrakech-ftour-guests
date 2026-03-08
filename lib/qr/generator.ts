import QRCode from "qrcode";
import { signGuestQrToken, verifyGuestQrToken } from "@/lib/auth/jwt";
import crypto from "crypto";

export interface GenerateQRCodeParams {
  email: string;
  first_name: string;
  last_name: string;
}

export interface QRCodeResult {
  token: string; // Unique token to store in DB
  imageDataUrl: string; // QR code image for display/email
}

export interface QRTokenPayload {
  email: string;
  name: string;
  hash: string;
}

/**
 * Generate a unique QR code for a guest
 * Returns both the token (to store in DB) and the image data URL
 */
export async function generateQRCode(
  params: GenerateQRCodeParams
): Promise<string> {
  // Create a unique hash based on guest data
  const hash = crypto
    .createHash("sha256")
    .update(`${params.email}-${params.first_name}-${params.last_name}-${Date.now()}-${Math.random()}`)
    .digest("hex")
    .substring(0, 32);

  // Sign the token
  const token = signGuestQrToken({ gid: hash });

  // Create QR code payload (this is what gets scanned)
  const payload = JSON.stringify({
    email: params.email,
    name: `${params.first_name} ${params.last_name}`,
    token,
    hash,
  });

  // Generate QR code as data URL
  const imageDataUrl = await QRCode.toDataURL(payload, {
    margin: 1,
    width: 320,
    color: {
      dark: "#000000",
      light: "#FDF4E3",
    },
  });

  // Return the token (hash) to store in database
  // The imageDataUrl will be generated on-demand or stored separately
  return hash;
}

/**
 * Generate QR code image from a stored token
 */
export async function generateQRCodeImage(token: string, email: string, name: string): Promise<string> {
  const payload = JSON.stringify({
    email,
    name,
    token: signGuestQrToken({ gid: token }),
    hash: token,
  });

  return await QRCode.toDataURL(payload, {
    margin: 1,
    width: 320,
    color: {
      dark: "#000000",
      light: "#FDF4E3",
    },
  });
}

/**
 * Verify and decode a QR code token
 * Returns the hash/token from the QR code payload, or null if invalid
 */
export function verifyQRToken(qrCodeText: string): string | null {
  try {
    // Parse the QR code payload
    const payload = JSON.parse(qrCodeText);

    if (!payload.token || !payload.hash) {
      return null;
    }

    // Verify the JWT token
    const decoded = verifyGuestQrToken(payload.token);

    if (!decoded || decoded.gid !== payload.hash) {
      return null;
    }

    // Return the hash which matches the qr_code field in DB
    return payload.hash;
  } catch {
    return null;
  }
}


