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

/**
 * Default From: address.
 *
 * MUST stay on a domain verified in Resend — `lineamode-apparel.com` is the
 * verified one. Anything else (including `lineamode.com`, which is not set up
 * in Resend) is rejected at send time. `onboarding@resend.dev` is Resend's
 * shared sandbox sender and only ever delivers to the address on the Resend
 * account itself, which is why it must not be used outside first-run testing.
 */
export const RESEND_FROM =
  process.env.RESEND_FROM ?? "Lineamode <no-reply@lineamode-apparel.com>";

/**
 * Where replies should go. We send as no-reply@, so every outbound message
 * sets Reply-To explicitly — otherwise a client hitting "reply" writes into a
 * mailbox nobody reads.
 */
export const RESEND_REPLY_TO =
  process.env.CONTACT_EMAIL_TO ?? "contact@lineamode-apparel.com";
