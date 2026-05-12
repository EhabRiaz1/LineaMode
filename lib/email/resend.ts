import "server-only";
import { Resend } from "resend";

let cached: Resend | null = null;

/**
 * Lazy Resend client. Returns null if RESEND_API_KEY is not configured so
 * callers can fall back to logging instead of crashing the request.
 */
export function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (cached) return cached;
  cached = new Resend(key);
  return cached;
}

export const RESEND_FROM = process.env.RESEND_FROM ?? "Lineamode <hello@lineamode.com>";
