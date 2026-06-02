export const PIPELINE_TYPES = [
  "design_idea",
  "design_scratch",
  "manufacture_existing",
  "contact_form",
] as const;
export const PROJECT_STATUSES = ["draft", "reviewing", "quoted", "in_progress", "delivered", "archived"] as const;
export const STEP_STATES = ["pending", "in_progress", "blocked", "done"] as const;

export type PipelineType = (typeof PIPELINE_TYPES)[number];
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type StepState = (typeof STEP_STATES)[number];
