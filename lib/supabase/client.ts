import "server-only";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { PipelineType, ProjectStatus, StepState } from "@/lib/pipelines/types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function invariantEnv() {
  if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not set");
  if (!SUPABASE_ANON_KEY) throw new Error("SUPABASE_ANON_KEY is not set");
  if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

export function getServiceRoleClient(): SupabaseClient {
  invariantEnv();
  return createClient(SUPABASE_URL as string, SUPABASE_SERVICE_ROLE_KEY as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getAnonClient(): SupabaseClient {
  invariantEnv();
  return createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export type AdminUser = {
  id: string;
  email: string;
  role: string;
  supabaseUser: User;
};

export async function requireAdminUser(authorization?: string): Promise<AdminUser> {
  if (!authorization || !authorization.toLowerCase().startsWith("bearer ")) {
    throw new UnauthorizedError("Missing bearer token");
  }
  const token = authorization.split(" ")[1];
  const client = getServiceRoleClient();

  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData?.user) {
    throw new UnauthorizedError("Invalid or expired token");
  }

  const user = userData.user;
  const { data: adminRow, error: adminError } = await client
    .from("admins")
    .select("id, email, role")
    .eq("id", user.id)
    .single();

  if (adminError || !adminRow) {
    throw new UnauthorizedError("User is not an admin");
  }

  return { ...adminRow, supabaseUser: user };
}

export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export const VALID_PIPELINE_TYPES: PipelineType[] = [
  "design_idea",
  "design_scratch",
  "manufacture_existing",
  "contact_form",
];
export const VALID_PROJECT_STATUSES: ProjectStatus[] = ["draft", "reviewing", "quoted", "in_progress", "delivered", "archived"];
export const VALID_STEP_STATES: StepState[] = ["pending", "in_progress", "blocked", "done"];
