"use client";

/**
 * Tiny client-side fetch helper used inside the admin console. Wraps every
 * call with the auth headers from <AdminSessionProvider> and surfaces
 * structured errors so individual pages can stay focussed on rendering.
 */
export type AdminFetchResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status?: number };

export async function adminFetch<T = unknown>(
  url: string,
  init: RequestInit & { authHeaders: Record<string, string> },
): Promise<AdminFetchResult<T>> {
  const { authHeaders, headers, ...rest } = init;
  try {
    const res = await fetch(url, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...(headers ?? {}),
      },
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: json?.error ?? `Request failed (${res.status})`, status: res.status };
    }
    return { ok: true, data: (json.data ?? json) as T };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}
