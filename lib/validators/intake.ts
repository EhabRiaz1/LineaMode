import { z } from "zod";
import { PIPELINE_TYPES } from "@/lib/pipelines/types";

const fileSchema = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  path: z.string().optional(),
});

export const attributionSchema = z
  .object({
    utm_source: z.string().max(120).optional(),
    utm_medium: z.string().max(120).optional(),
    utm_campaign: z.string().max(120).optional(),
    utm_term: z.string().max(120).optional(),
    utm_content: z.string().max(120).optional(),
    referrer: z.string().max(2048).optional(),
    landing_path: z.string().max(2048).optional(),
    session_id: z.string().max(80).optional(),
  })
  .partial();

export const deviceSchema = z
  .object({
    viewport_w: z.number().int().nonnegative().optional(),
    viewport_h: z.number().int().nonnegative().optional(),
    dpr: z.number().nonnegative().optional(),
    locale: z.string().max(20).optional(),
    timezone: z.string().max(60).optional(),
    user_agent: z.string().max(512).optional(),
    connection: z.string().max(20).optional(),
    save_data: z.boolean().optional(),
  })
  .partial();

export const optionalSignalsSchema = z
  .object({
    brand_stage: z.enum(["emerging", "established", "heritage"]).optional(),
    calendar_tier: z.enum(["ss", "fw", "drop_led", "continuous"]).optional(),
    volume_bracket: z.enum(["lt_500", "500_2k", "2k_10k", "gt_10k"]).optional(),
    priorities: z
      .array(z.enum(["material", "certification", "labour", "packaging"]))
      .max(4)
      .optional(),
    role: z.enum(["ceo", "designer", "sourcing", "producer", "other"]).optional(),
    preferred_channel: z.enum(["email", "call", "in_person"]).optional(),
  })
  .partial();

const baseContact = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  company: z.string().optional(),
  phone: z
    .string()
    .trim()
    .min(7)
    .refine((value) => value.replace(/\D/g, "").length >= 7, "Phone number is too short"),
  country: z.string().optional(),
  timeline: z.string().optional(),
  budgetRange: z.string().optional(),
  notes: z.string().optional(),
  files: z.array(fileSchema).max(8).optional(),
  attribution: attributionSchema.optional(),
  device: deviceSchema.optional(),
  signals: optionalSignalsSchema.optional(),
});

const ideaBrief = z.object({
  goals: z.string().min(1),
  inspirations: z.array(z.string().min(1)).max(10).optional(),
  constraints: z.string().optional(),
});

const scratchBrief = z.object({
  requirements: z.string().min(1),
  brandAssets: z.string().optional(),
  specs: z.string().optional(),
  collaboration: z.string().optional(),
});

const manufactureBrief = z.object({
  cadLinks: z.array(z.string().min(1)).max(10).optional(),
  materials: z.string().optional(),
  quantities: z.string().optional(),
  shippingRegion: z.string().optional(),
});

const designIdea = baseContact.extend({
  pipelineType: z.literal("design_idea"),
  brief: ideaBrief,
});

const designScratch = baseContact.extend({
  pipelineType: z.literal("design_scratch"),
  brief: scratchBrief,
});

const manufactureExisting = baseContact.extend({
  pipelineType: z.literal("manufacture_existing"),
  brief: manufactureBrief,
});

export const intakePayloadSchema = z.discriminatedUnion("pipelineType", [
  designIdea,
  designScratch,
  manufactureExisting,
]);

export type IntakePayload = z.infer<typeof intakePayloadSchema>;
export type IntakeFile = z.infer<typeof fileSchema>;
export type IntakePipelineType = (typeof PIPELINE_TYPES)[number];
export type IntakeAttribution = z.infer<typeof attributionSchema>;
export type IntakeDevice = z.infer<typeof deviceSchema>;
export type IntakeSignals = z.infer<typeof optionalSignalsSchema>;

export const intakeEventSchema = z.object({
  session_id: z.string().min(8).max(80),
  event: z.string().min(1).max(80),
  payload: z.record(z.string(), z.unknown()).optional(),
  occurred_at: z.string().datetime().optional(),
});

export type IntakeEvent = z.infer<typeof intakeEventSchema>;

export const lookupEmailSchema = z.object({
  email: z.string().email(),
});
