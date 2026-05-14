import { z } from "zod";
import { respond } from "@/lib/api/responses";
import { verifyTOTP } from "@/lib/2fa/totp";
import { getAnonClient, getServiceRoleClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  code: z.string().regex(/^\d{6}$/).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = loginSchema.safeParse(json);

    if (!parsed.success) {
      return respond.badRequest("Invalid login payload", parsed.error.flatten());
    }

    const { email, password, code } = parsed.data;
    const authClient = getAnonClient();
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user || !authData.session) {
      return respond.unauthorized("Invalid email or password");
    }

    const supabase = getServiceRoleClient();
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("id, email, totp_enabled, totp_secret")
      .eq("id", authData.user.id)
      .single();

    if (adminError || !admin) {
      return respond.forbidden("This account is not an admin");
    }

    if (admin.totp_enabled) {
      if (!admin.totp_secret) {
        return respond.unauthorized("Two-factor authentication is not configured correctly");
      }

      if (!code) {
        return respond.ok({ requiresTotp: true });
      }

      if (!verifyTOTP(admin.totp_secret, code)) {
        return respond.unauthorized("Invalid authenticator code");
      }
    }

    return respond.ok({
      requiresTotp: false,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_at: authData.session.expires_at,
        expires_in: authData.session.expires_in,
        token_type: authData.session.token_type,
      },
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    });
  } catch (error) {
    return respond.serverError(
      "Failed to sign in",
      error instanceof Error ? error.message : String(error),
    );
  }
}
