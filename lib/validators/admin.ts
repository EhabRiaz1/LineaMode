import { z } from "zod";
import { PROJECT_STATUSES, STEP_STATES } from "@/lib/pipelines/types";

export const projectUpdateSchema = z.object({
  status: z.enum(PROJECT_STATUSES).optional(),
  currentStep: z.string().optional(),
  note: z.string().optional(),
  stepState: z.enum(STEP_STATES).optional(),
});

export type ProjectUpdatePayload = z.infer<typeof projectUpdateSchema>;
