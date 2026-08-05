import { respond } from "@/lib/api/responses";
import { requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

/**
 * Delivery log, read live from Resend.
 *
 * Uses `fetch` against the REST API rather than the SDK so the exact response
 * shape is pinned here and visible: Resend returns
 * `{ object, has_more, data: [{ id, to, from, subject, created_at, last_event, ... }] }`.
 * Nothing is persisted locally — this view always matches the Resend
 * dashboard, and is bounded by Resend's own retention.
 */

type ResendEmail = {
  id: string;
  to: string[] | null;
  from: string;
  subject: string;
  created_at: string;
  last_event: string | null;
};

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);

    const key = process.env.RESEND_API_KEY;
    if (!key) {
      return respond.ok({
        configured: false,
        emails: [],
        hasMore: false,
      });
    }

    const res = await fetch("https://api.resend.com/emails", {
      headers: { Authorization: `Bearer ${key}` },
      // Always hit Resend directly; a cached delivery log is a misleading one.
      cache: "no-store",
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return respond.serverError(
        `Resend returned ${res.status} for the delivery log.`,
        detail.slice(0, 500),
      );
    }

    const body = (await res.json()) as { data?: ResendEmail[]; has_more?: boolean };
    const rows = Array.isArray(body.data) ? body.data : [];

    return respond.ok({
      configured: true,
      hasMore: Boolean(body.has_more),
      emails: rows.map((row) => ({
        id: row.id,
        to: row.to ?? [],
        from: row.from,
        subject: row.subject,
        createdAt: row.created_at,
        status: row.last_event ?? "unknown",
      })),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to load the delivery log",
      error instanceof Error ? error.message : String(error),
    );
  }
}
