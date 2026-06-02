import "server-only";
import { getServiceRoleClient } from "@/lib/supabase/client";

export type ContactSubmission = {
  name: string;
  brand: string;
  email: string;
  productType: string;
  moq?: string;
  message: string;
};

export function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export async function persistContactSubmission(data: ContactSubmission) {
  const supabase = getServiceRoleClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert(
      {
        email: data.email,
        name: data.name,
        company: data.brand,
      },
      { onConflict: "email" },
    )
    .select("*")
    .single();

  if (customerError || !customer) {
    throw new Error(customerError?.message ?? "Unable to save customer");
  }

  const brief = {
    productType: data.productType,
    moq: data.moq ?? null,
    message: data.message,
  };

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      customer_id: customer.id,
      pipeline_type: "contact_form",
      status: "draft",
      current_step: "contact_submitted",
      brief,
    })
    .select("*")
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Unable to create project");
  }

  const intake = {
    source: "contact_form",
    name: data.name,
    brand: data.brand,
    email: data.email,
    productType: data.productType,
    moq: data.moq ?? null,
    message: data.message,
  };

  const { error: enquiryError } = await supabase.from("enquiries").insert({
    project_id: project.id,
    intake,
    source: "contact_form",
  });

  if (enquiryError) {
    throw new Error(enquiryError.message ?? "Unable to store enquiry");
  }

  await supabase.from("pipeline_steps").insert({
    project_id: project.id,
    label: "contact_submitted",
    state: "done",
    note: "Submitted via contact form",
    actor_role: "system",
  });

  return { projectId: project.id, customerId: customer.id };
}
