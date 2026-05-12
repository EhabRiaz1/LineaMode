import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

export async function GET(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    
    const { data, error } = await supabase
      .from("admins")
      .select("totp_enabled")
      .eq("id", admin.id)
      .single();
    
    if (error) {
      return respond.serverError("Unable to fetch 2FA status", error.message);
    }
    
    return respond.ok({
      totp_enabled: data?.totp_enabled ?? false,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to get 2FA status",
      error instanceof Error ? error.message : String(error),
    );
  }
}
