"use client";

import type { IntakeAttribution, IntakeDevice } from "@/lib/validators/intake";
import { getStartSessionId } from "./analytics";

const STORAGE_KEY = "lm_attribution";

/**
 * Read attribution + device signals on the client. Attribution is captured
 * once per session (first landing) so a user who opens /start, navigates
 * away, and comes back keeps their original UTMs.
 *
 * These objects are added to the intake payload at submit time.
 */
export function captureAttribution(): IntakeAttribution {
  if (typeof window === "undefined") return {};
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as IntakeAttribution;
    } catch {
      // Fallthrough to recapture below.
    }
  }
  const params = new URLSearchParams(window.location.search);
  const attribution: IntakeAttribution = {
    utm_source: params.get("utm_source") ?? undefined,
    utm_medium: params.get("utm_medium") ?? undefined,
    utm_campaign: params.get("utm_campaign") ?? undefined,
    utm_term: params.get("utm_term") ?? undefined,
    utm_content: params.get("utm_content") ?? undefined,
    referrer: document.referrer || undefined,
    landing_path: window.location.pathname || undefined,
    session_id: getStartSessionId(),
  };
  for (const key of Object.keys(attribution)) {
    if (attribution[key as keyof IntakeAttribution] === undefined) {
      delete attribution[key as keyof IntakeAttribution];
    }
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  return attribution;
}

export function captureDevice(): IntakeDevice {
  if (typeof window === "undefined") return {};
  const conn = (
    navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean } }
  ).connection;
  return {
    viewport_w: window.innerWidth,
    viewport_h: window.innerHeight,
    dpr: window.devicePixelRatio,
    locale: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    user_agent: navigator.userAgent.slice(0, 500),
    connection: conn?.effectiveType,
    save_data: conn?.saveData,
  };
}
