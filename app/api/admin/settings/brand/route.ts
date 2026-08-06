import { revalidateTag } from "next/cache";
import { respond } from "@/lib/api/responses";
import { cmsTags } from "@/lib/cms/cache-tags";
import {
  BRAND_TOKENS_DEFAULTS,
  BRAND_TOKENS_SETTING_KEY,
  brandTokensSchema,
  parseBrandTokens,
} from "@/lib/cms/brand-schema";
import {
  getServiceRoleClient,
  requireAdminUser,
  UnauthorizedError,
} from "@/lib/supabase/client";

/** Site-wide SEO defaults and footer copy, editable at /admin/settings/brand. */

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("cms_settings")
      .select("value")
      .eq("key", BRAND_TOKENS_SETTING_KEY)
      .maybeSingle();

    if (error) return respond.serverError("Unable to load brand tokens", error.message);

    return respond.ok({
      tokens: data?.value ? parseBrandTokens(data.value) : BRAND_TOKENS_DEFAULTS,
      usingDefaults: !data?.value,
      defaults: BRAND_TOKENS_DEFAULTS,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to load brand tokens",
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);

    const body = await request.json().catch(() => null);
    const parsed = brandTokensSchema.safeParse(body?.tokens);
    if (!parsed.success) {
      return respond.badRequest(
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
      );
    }

    const supabase = getServiceRoleClient();
    const { error } = await supabase.from("cms_settings").upsert(
      {
        key: BRAND_TOKENS_SETTING_KEY,
        value: parsed.data,
        updated_by: admin.id,
      },
      { onConflict: "key" },
    );

    if (error) return respond.serverError("Unable to save brand tokens", error.message);

    // These feed root metadata and the footer on every customer page, so the
    // whole site's cached output has to drop, not just the settings row.
    revalidateTag(cmsTags.brandTokens(), "max");
    revalidateTag(cmsTags.setting(BRAND_TOKENS_SETTING_KEY), "max");
    revalidateTag(cmsTags.settingsIndex(), "max");

    return respond.ok({ tokens: parsed.data });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to save brand tokens",
      error instanceof Error ? error.message : String(error),
    );
  }
}
