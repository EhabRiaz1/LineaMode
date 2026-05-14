import { z } from "zod";
import { PROJECT_STATUSES, STEP_STATES } from "@/lib/pipelines/types";

export const projectUpdateSchema = z.object({
  status: z.enum(PROJECT_STATUSES).optional(),
  currentStep: z.string().optional(),
  note: z.string().optional(),
  stepState: z.enum(STEP_STATES).optional(),
  customer: z
    .object({
      name: z.string().max(160).nullable().optional(),
      email: z.string().email().optional(),
      company: z.string().max(200).nullable().optional(),
      country: z.string().max(120).nullable().optional(),
      phone: z
        .string()
        .trim()
        .min(7)
        .refine((value) => value.replace(/\D/g, "").length >= 7, "Phone number is too short")
        .nullable()
        .optional(),
    })
    .optional(),
});

export type ProjectUpdatePayload = z.infer<typeof projectUpdateSchema>;
