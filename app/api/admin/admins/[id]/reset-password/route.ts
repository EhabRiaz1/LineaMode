import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { randomBytes } from "crypto";

type Context = { params: Promise<{ id: string }> };

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  const bytes = randomBytes(12);
  for (let i = 0; i < 12; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

export async function POST(request: Request, context: Context) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { id } = await context.params;
    const supabase = getServiceRoleClient();
    
    // Check if current user is super admin
    const { data: currentAdmin, error: currentError } = await supabase
      .from("admins")
      .select("is_super_admin")
      .eq("id", admin.id)
      .single();
    
    if (currentError || !currentAdmin?.is_super_admin) {
      return respond.forbidden("Only super admins can reset passwords");
    }

    // Generate new temporary password
    const tempPassword = generateTempPassword();

    // Update auth user password
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      password: tempPassword,
    });

    if (authError) {
      return respond.serverError("Failed to reset password", authError.message);
    }

    // Mark as temp password
    await supabase
      .from("admins")
      .update({ temp_password: true })
      .eq("id", id);

    return respond.ok({
      temp_password: tempPassword,
      message: "Password reset successfully. Share the new temporary password securely.",
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to reset password",
      error instanceof Error ? error.message : String(error),
    );
  }
}
