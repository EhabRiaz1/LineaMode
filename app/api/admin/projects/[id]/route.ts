import { respond } from "@/lib/api/responses";
import { projectUpdateSchema } from "@/lib/validators/admin";
import { getServiceRoleClient, requireAdminUser, UnauthorizedError } from "@/lib/supabase/client";

type Params = Promise<{ id: string }>;

export async function GET(request: Request, { params }: { params: Params }) {
  try {
    await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { id } = await params;
    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("projects")
      .select(
        `
        id,
        pipeline_type,
        status,
        current_step,
        brief,
        brand_stage,
        volume_bracket,
        calendar_tier,
        priorities,
        assigned_admin_id,
        created_at,
        updated_at,
        customers:customer_id (id, name, email, company, country, phone, attribution, device),
        enquiries (id, intake, notes, created_at),
        attachments (id, file_name, file_type, file_size_bytes, storage_path, created_at),
        pipeline_steps (id, label, state, note, actor_id, actor_role, created_at),
        project_notes (id, body, author_id, created_at, updated_at)
      `
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return respond.notFound("Project not found");
    }

    return respond.ok({ project: data });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to fetch project",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const admin = await requireAdminUser(request.headers.get("authorization") ?? undefined);
    const { id } = await params;
    const supabase = getServiceRoleClient();
    const body = await request.json();
    const parsed = projectUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return respond.badRequest("Invalid update payload", parsed.error.flatten());
    }

    const payload = parsed.data;
    if (!payload.status && !payload.currentStep && !payload.note && !payload.stepState && !payload.customer) {
      return respond.badRequest("No changes provided");
    }

    const updateFields: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (payload.status) updateFields.status = payload.status;
    if (payload.currentStep) updateFields.current_step = payload.currentStep;

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .update(updateFields)
      .eq("id", id)
      .select("*")
      .single();

    if (projectError || !project) {
      return respond.serverError("Unable to update project", projectError?.message);
    }

    if (payload.customer) {
      const customerUpdate = Object.fromEntries(
        Object.entries(payload.customer).filter(([, value]) => value !== undefined),
      );

      if (Object.keys(customerUpdate).length > 0) {
        const { error: customerError } = await supabase
          .from("customers")
          .update(customerUpdate)
          .eq("id", project.customer_id);

        if (customerError) {
          return respond.serverError("Project updated, but failed to update customer", customerError.message);
        }

        const { data: enquiries, error: enquiriesError } = await supabase
          .from("enquiries")
          .select("id, intake")
          .eq("project_id", project.id);

        if (enquiriesError) {
          return respond.serverError("Customer updated, but failed to load intake snapshots", enquiriesError.message);
        }

        const intakeUpdates = await Promise.all(
          (enquiries ?? []).map((enquiry) => {
            const intake =
              enquiry.intake && typeof enquiry.intake === "object" && !Array.isArray(enquiry.intake)
                ? { ...(enquiry.intake as Record<string, unknown>), ...customerUpdate }
                : customerUpdate;
            return supabase.from("enquiries").update({ intake }).eq("id", enquiry.id);
          }),
        );
        const intakeError = intakeUpdates.find((result) => result.error)?.error;
        if (intakeError) {
          return respond.serverError("Customer updated, but failed to sync intake snapshots", intakeError.message);
        }
      }
    }

    if (payload.note || payload.status || payload.stepState) {
      const label = payload.currentStep ?? payload.status ?? "update";
      const { error: stepError } = await supabase.from("pipeline_steps").insert({
        project_id: project.id,
        label,
        state: payload.stepState ?? "done",
        note: payload.note ?? null,
        actor_id: admin.id,
        actor_role: admin.role,
      });
      if (stepError) {
        return respond.serverError("Project updated, but failed to log step", stepError.message);
      }
    }

    return respond.ok({ project });
  } catch (error) {
    if (error instanceof UnauthorizedError) return respond.unauthorized(error.message);
    return respond.serverError(
      "Failed to update project",
      error instanceof Error ? error.message : String(error)
    );
  }
}
