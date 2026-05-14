import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { verifyTOTP } from "@/lib/2fa/totp";

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    
    const body = await request.json();
    const { code } = body as { code: string };
    const normalizedCode = code?.trim();
    
    if (!normalizedCode || !/^\d{6}$/.test(normalizedCode)) {
      return respond.badRequest("Invalid verification code");
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
    
    if (!currentAdmin.totp_secret) {
      return respond.badRequest("2FA setup not started. Please initiate setup first.");
    }
    
    // Verify the code
    const isValid = verifyTOTP(currentAdmin.totp_secret, normalizedCode);
    
    if (!isValid) {
      return respond.badRequest("Invalid verification code. Please try again.");
    }
    
    // Enable 2FA
    const { error: updateError } = await supabase
      .from("admins")
      .update({ totp_enabled: true })
      .eq("id", admin.id);
    
    if (updateError) {
      return respond.serverError("Failed to enable 2FA", updateError.message);
    }
    
    return respond.ok({
      message: "2FA enabled successfully",
      totp_enabled: true,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to verify 2FA",
      error instanceof Error ? error.message : String(error),
    );
  }
}
