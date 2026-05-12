import { respond } from "@/lib/api/responses";
import { getServiceRoleClient } from "@/lib/supabase/client";
import { lookupEmailSchema } from "@/lib/validators/intake";
import { hashIp, parseIp } from "@/lib/utils/ip";
import { rateLimit } from "@/lib/utils/rate-limit";

/**
 * Returning-customer detection used by /start. The Letter form pings this
 * endpoint after the email field debounces. We deliberately return only a
 * minimal envelope (`known`, plus the customer's own name + company *if*
 * the email already exists). Unknown emails get nothing back so the
 * endpoint can't be used to enumerate the customer base.
 *
 * Rate-limited aggressively per IP to prevent scraping.
 */
export async function POST(request: Request) {
  try {
    const ipHash = hashIp(parseIp(request));
    const limit = rateLimit(`lookup-email:${ipHash ?? "unknown"}`, {
      capacity: 12,
      refillPerSec: 0.2,
    });
    if (!limit.allowed) {
      return respond.unprocessable("Slow down.", { resetMs: limit.resetMs });
    }

    const body = await request.json().catch(() => null);
    const parsed = lookupEmailSchema.safeParse(body);
    if (!parsed.success) {
      return respond.badRequest("Invalid email", parsed.error.flatten());
    }

    const supabase = getServiceRoleClient();
    const { data, error } = await supabase
      .from("customers")
      .select("name, company")
      .eq("email", parsed.data.email)
      .maybeSingle();

    if (error) {
      return respond.serverError("Lookup failed", error.message);
    }

    if (!data) {
      return respond.ok({ known: false });
    }

    return respond.ok({
      known: true,
      name: data.name ?? null,
      company: data.company ?? null,
    });
  } catch (error) {
    return respond.serverError(
      "Lookup failed",
      error instanceof Error ? error.message : String(error)
    );
  }
}
