import { respond } from "@/lib/api/responses";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { intakeEventSchema } from "@/lib/validators/intake";
import { hashIp, parseIp } from "@/lib/utils/ip";
import { rateLimit } from "@/lib/utils/rate-limit";

/**
 * Fire-and-forget funnel events from /start.
 *
 * Anyone can POST. Rate-limited per IP-hash so a hostile client can't
 * flood the table. Validation + IP-hashing prevents PII leak.
 */
export async function POST(request: Request) {
  try {
    const ipHash = hashIp(parseIp(request));
    const limit = rateLimit(`intake-event:${ipHash ?? "unknown"}`, {
      capacity: 30,
      refillPerSec: 2,
    });
    if (!limit.allowed) {
      return respond.unprocessable("Too many events, slow down.", { resetMs: limit.resetMs });
    }

    const body = await request.json().catch(() => null);
    const parsed = intakeEventSchema.safeParse(body);
    if (!parsed.success) {
      return respond.badRequest("Invalid event payload", parsed.error.flatten());
    }

    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("intake_events").insert({
      session_id: parsed.data.session_id,
      event: parsed.data.event,
      payload: parsed.data.payload ?? null,
      ip_hash: ipHash,
      user_agent: request.headers.get("user-agent") ?? null,
      occurred_at: parsed.data.occurred_at ?? new Date().toISOString(),
    });

    if (error) {
      return respond.serverError("Unable to record event", error.message);
    }

    return respond.ok({ accepted: true });
  } catch (error) {
    return respond.serverError(
      "Failed to record intake event",
      error instanceof Error ? error.message : String(error)
    );
  }
}
