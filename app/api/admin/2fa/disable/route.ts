import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { verifyTOTP } from "@/lib/2fa/totp";

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    
    const body = await request.json();
    const { code } = body as { code: string };
    
    if (!code || code.length !== 6) {
      return respond.badRequest("Verification code required to disable 2FA");
    }
    
    // Get the stored secret
    const { data: currentAdmin, error: fetchError } = await supabase
      .from("admins")
      .select("totp_secret, totp_enabled")
      .eq("id", admin.id)
      .single();
    
    if (fetchError) {
      return respond.serverError("Unable to fetch admin", fetchError.message);
    }
    
    if (!currentAdmin.totp_enabled) {
      return respond.badRequest("2FA is not enabled for this account");
    }
    
    // Verify the code before disabling
    const isValid = verifyTOTP(currentAdmin.totp_secret, code);
    
    if (!isValid) {
      return respond.badRequest("Invalid verification code");
    }
    
    // Disable 2FA and clear secret
    const { error: updateError } = await supabase
      .from("admins")
      .update({ totp_enabled: false, totp_secret: null })
      .eq("id", admin.id);
    
    if (updateError) {
      return respond.serverError("Failed to disable 2FA", updateError.message);
    }
    
    return respond.ok({
      message: "2FA disabled successfully",
      totp_enabled: false,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to disable 2FA",
      error instanceof Error ? error.message : String(error),
    );
  }
}
