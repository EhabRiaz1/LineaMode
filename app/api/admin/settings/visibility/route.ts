import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { revalidateTag } from "next/cache";
import { cmsTags } from "@/lib/cms/cache-tags";

export type PageVisibility = {
  [key: string]: {
    navbar: boolean;
    homepage: boolean;
  };
};

export async function GET(request: Request) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    
    const { data, error } = await supabase
      .from("cms_settings")
      .select("value")
      .eq("key", "page_visibility")
      .maybeSingle();
    
    if (error) {
      return respond.serverError("Unable to fetch page visibility settings", error.message);
    }
    
    const visibility = (data?.value as PageVisibility) ?? {
      lookbook: { navbar: true, homepage: true },
      journal: { navbar: true, homepage: true },
    };
    
    return respond.ok({ visibility });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to fetch page visibility",
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    
    const body = await request.json();
    const visibility = body.visibility as PageVisibility;
    
    if (!visibility || typeof visibility !== "object") {
      return respond.badRequest("Invalid visibility data");
    }
    
    const { error } = await supabase
      .from("cms_settings")
      .upsert(
        {
          key: "page_visibility",
          value: visibility,
          updated_by: admin.id,
        },
        { onConflict: "key" }
      );
    
    if (error) {
      return respond.serverError("Unable to save page visibility settings", error.message);
    }
    
    // Invalidate cache so the customer site picks up changes
    // (Next 16: pass 'max' for stale-while-revalidate semantics).
    revalidateTag(cmsTags.setting("page_visibility"), "max");
    
    return respond.ok({ visibility });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to save page visibility",
      error instanceof Error ? error.message : String(error),
    );
  }
}
