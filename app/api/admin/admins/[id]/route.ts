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

export async function PUT(request: Request, context: Context) {
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
      return respond.forbidden("Only super admins can update admin accounts");
    }

    const body = await request.json();
    const { display_name, is_super_admin } = body as {
      display_name?: string;
      is_super_admin?: boolean;
    };

    const updates: Record<string, unknown> = {};
    if (display_name !== undefined) updates.display_name = display_name || null;
    if (is_super_admin !== undefined) updates.is_super_admin = is_super_admin;

    if (Object.keys(updates).length === 0) {
      return respond.badRequest("No updates provided");
    }

    const { data, error } = await supabase
      .from("admins")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return respond.serverError("Failed to update admin", error.message);
    }

    return respond.ok({ admin: data });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to update admin",
      error instanceof Error ? error.message : String(error),
    );
  }
}

export async function DELETE(request: Request, context: Context) {
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
      return respond.forbidden("Only super admins can delete admin accounts");
    }

    // Prevent self-deletion
    if (id === admin.id) {
      return respond.badRequest("Cannot delete your own account");
    }

    // Delete from admins table
    const { error: deleteError } = await supabase
      .from("admins")
      .delete()
      .eq("id", id);

    if (deleteError) {
      return respond.serverError("Failed to delete admin record", deleteError.message);
    }

    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(id);
    if (authError) {
      console.error("Failed to delete auth user:", authError);
    }

    return respond.ok({ message: "Admin deleted successfully" });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to delete admin",
      error instanceof Error ? error.message : String(error),
    );
  }
}
