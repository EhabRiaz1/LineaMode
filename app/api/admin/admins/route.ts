import { respond } from "@/lib/api/responses";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";
import { randomBytes } from "crypto";

export type AdminRow = {
  id: string;
  email: string;
  display_name: string | null;
  is_super_admin: boolean;
  totp_enabled: boolean;
  temp_password: boolean;
  created_at: string;
  created_by: string | null;
};

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  const bytes = randomBytes(12);
  for (let i = 0; i < 12; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    
    const supabase = getServiceRoleClient();
    
    // Check if current user is super admin
    const { data: currentAdmin, error: currentError } = await supabase
      .from("admins")
      .select("is_super_admin")
      .eq("id", admin.id)
      .single();
    
    if (currentError || !currentAdmin?.is_super_admin) {
      return respond.forbidden("Only super admins can view admin accounts");
    }

    const { data, error } = await supabase
      .from("admins")
      .select("id, email, display_name, is_super_admin, totp_enabled, temp_password, created_at, created_by")
      .order("created_at", { ascending: false });

    if (error) {
      return respond.serverError("Unable to fetch admins", error.message);
    }

    return respond.ok({ admins: data ?? [] });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to fetch admins",
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const supabase = getServiceRoleClient();
    
    // Check if current user is super admin
    const { data: currentAdmin, error: currentError } = await supabase
      .from("admins")
      .select("is_super_admin")
      .eq("id", admin.id)
      .single();
    
    if (currentError || !currentAdmin?.is_super_admin) {
      return respond.forbidden("Only super admins can create admin accounts");
    }

    const body = await request.json();
    const { email, display_name, is_super_admin } = body as {
      email: string;
      display_name?: string;
      is_super_admin?: boolean;
    };

    if (!email || !email.includes("@")) {
      return respond.badRequest("Valid email is required");
    }

    // Generate temporary password
    const tempPassword = generateTempPassword();

    // Create Supabase Auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });

    if (authError) {
      return respond.serverError("Failed to create auth user", authError.message);
    }

    // Create admin record
    const { data: newAdmin, error: insertError } = await supabase
      .from("admins")
      .insert({
        id: authUser.user.id,
        email,
        display_name: display_name || null,
        is_super_admin: is_super_admin ?? false,
        temp_password: true,
        created_by: admin.id,
      })
      .select()
      .single();

    if (insertError) {
      // Try to clean up auth user if admin insert fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return respond.serverError("Failed to create admin record", insertError.message);
    }

    return respond.ok({
      admin: newAdmin,
      temp_password: tempPassword,
      message: "Admin created successfully. Share the temporary password securely.",
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to create admin",
      error instanceof Error ? error.message : String(error),
    );
  }
}
