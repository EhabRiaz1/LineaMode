import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { generateSecret, generateOtpAuthUrl } from "@/lib/2fa/totp";

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    
    // Check if 2FA is already enabled
    const { data: currentAdmin, error: fetchError } = await supabase
      .from("admins")
      .select("email, totp_enabled, totp_secret")
      .eq("id", admin.id)
      .single();
    
    if (fetchError) {
      return respond.serverError("Unable to fetch admin", fetchError.message);
    }
    
    if (currentAdmin.totp_enabled) {
      return respond.badRequest("2FA is already enabled for this account");
    }
    
    // Generate a new secret
    const secret = generateSecret();
    const otpAuthUrl = generateOtpAuthUrl(secret, currentAdmin.email);
    
    // Store the secret (but don't enable yet)
    const { error: updateError } = await supabase
      .from("admins")
      .update({ totp_secret: secret })
      .eq("id", admin.id);
    
    if (updateError) {
      return respond.serverError("Failed to store 2FA secret", updateError.message);
    }
    
    return respond.ok({
      secret,
      otpauth_url: otpAuthUrl,
      qr_data: otpAuthUrl,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to setup 2FA",
      error instanceof Error ? error.message : String(error),
    );
  }
}
