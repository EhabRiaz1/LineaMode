"use client";

/**
 * Lightweight client-side analytics for the /start funnel.
 *
 * We POST events to /api/public/intake-event on a 1.5s flush interval to
 * batch and stay below typical rate-limit thresholds. The browser's
 * `sendBeacon` is used on unload so a final batch ships even if the user
 * closes the tab mid-flow.
 */

export type StartEventName =
  | "landed"
  | "pipeline_chosen"
  | "letter_started"
  | "letter_step_view"
  | "letter_step_complete"
  | "letter_back_to_reel"
  | "letter_dropoff"
  | "intake_submitted"
  | "intake_submit_failed";

type Queued = {
  session_id: string;
  event: StartEventName;
  payload?: Record<string, unknown>;
  occurred_at: string;
};

const KEY = "lm_session_id";
const FLUSH_MS = 1500;

let queue: Queued[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let unloadBound = false;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(KEY, id);
  }
  return id;
}

async function flush() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (queue.length === 0) return;
  const batch = queue;
  queue = [];
  try {
    await Promise.all(
      batch.map((item) =>
        fetch("/api/public/intake-event", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(item),
          keepalive: true,
        }).catch(() => null),
      ),
    );
  } catch {
    // Discard — analytics must never break the form.
  }
}

function scheduleFlush() {
  if (timer) return;
  timer = setTimeout(() => {
    void flush();
  }, FLUSH_MS);
}

function bindUnload() {
  if (unloadBound) return;
  if (typeof window === "undefined") return;
  unloadBound = true;
  const handler = () => {
    if (queue.length === 0) return;
    if (typeof navigator === "undefined" || !("sendBeacon" in navigator)) {
      void flush();
      return;
    }
    for (const item of queue) {
      const blob = new Blob([JSON.stringify(item)], { type: "application/json" });
      navigator.sendBeacon("/api/public/intake-event", blob);
    }
    queue = [];
  };
  window.addEventListener("pagehide", handler);
  window.addEventListener("beforeunload", handler);
}

export function trackStart(event: StartEventName, payload?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  bindUnload();
  queue.push({
    session_id: getSessionId(),
    event,
    payload,
    occurred_at: new Date().toISOString(),
  });
  scheduleFlush();
}

export function getStartSessionId(): string {
  return getSessionId();
}
