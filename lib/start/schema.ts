import { z } from "zod";
import {
  attributionSchema,
  deviceSchema,
  optionalSignalsSchema,
} from "@/lib/validators/intake";
import { PIPELINE_TYPES } from "@/lib/pipelines/types";

/**
 * Single source of truth for the /start questionnaire ('The Loom Reel').
 *
 * The original IntakeFlow had three branching schemas — one per pipeline.
 * The Loom Reel asks the same set of questions in a unified flow and lets
 * the chosen pipeline shape *which* fields surface. We keep a discriminated
 * union for type-safety on the brief, but the contact + signal fields are
 * shared across all three.
 *
 * The server still accepts the original `intakePayloadSchema` from
 * `lib/validators/intake.ts`; this schema is the *client-side* shape we
 * collect, with a small adapter (`toIntakePayload`) translating to the API.
 */

const fileMeta = z.object({
  name: z.string().min(1),
  type: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  path: z.string().optional(),
});

const sharedContact = z.object({
  name: z.string().min(2, "Tell us how to address you."),
  email: z.string().email("That doesn't look like a valid email."),
  company: z.string().optional(),
  phone: z
    .string()
    .trim()
    .min(7, "Add a phone number we can reach you on.")
    .refine((value) => value.replace(/\D/g, "").length >= 7, "That phone number looks too short."),
  country: z.string().optional(),
  timeline: z.string().optional(),
  budgetRange: z.string().optional(),
});

const sharedNotes = z.object({
  notes: z.string().optional(),
  files: z.array(fileMeta).max(8).optional(),
});

const ideaBrief = z.object({
  goals: z.string().min(1, "A few words on what you’re chasing."),
  inspirations: z.array(z.string().min(1)).max(10).optional(),
  constraints: z.string().optional(),
});

const scratchBrief = z.object({
  requirements: z.string().min(1, "What does the spec ask for?"),
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

export const PIPELINE_LABELS: Record<(typeof PIPELINE_TYPES)[number], { eyebrow: string; title: string }> = {
  design_idea: { eyebrow: "01", title: "From an idea." },
  design_scratch: { eyebrow: "02", title: "From scratch." },
  manufacture_existing: { eyebrow: "03", title: "From a CAD." },
  contact_form: { eyebrow: "—", title: "Contact form." },
};

export const startBaseSchema = sharedContact.merge(sharedNotes).extend({
  attribution: attributionSchema.optional(),
  device: deviceSchema.optional(),
  signals: optionalSignalsSchema.optional(),
});

const ideaShape = startBaseSchema.extend({
  pipelineType: z.literal("design_idea"),
  brief: ideaBrief,
});
const scratchShape = startBaseSchema.extend({
  pipelineType: z.literal("design_scratch"),
  brief: scratchBrief,
});
const manufactureShape = startBaseSchema.extend({
  pipelineType: z.literal("manufacture_existing"),
  brief: manufactureBrief,
});

export const startPayloadSchema = z.discriminatedUnion("pipelineType", [
  ideaShape,
  scratchShape,
  manufactureShape,
]);

export type StartPayload = z.infer<typeof startPayloadSchema>;
export type IdeaPayload = z.infer<typeof ideaShape>;
export type ScratchPayload = z.infer<typeof scratchShape>;
export type ManufacturePayload = z.infer<typeof manufactureShape>;

/**
 * Question shape used by [LetterStep]. Each pipeline maps to a list of these.
 * Keeping the description in data (rather than JSX) means the editor can
 * reorder, hide, or re-word a question without touching component code.
 */
export type LetterField = {
  id: string;
  step: number;
  eyebrow: string;
  prompt: string;
  helper?: string;
  required?: boolean;
  field:
    | { kind: "text"; placeholder?: string }
    | { kind: "textarea"; placeholder?: string; rows?: number }
    | { kind: "email" }
    | { kind: "tel" }
    | {
        kind: "chips";
        multiple?: boolean;
        options: { value: string; label: string }[];
      }
    | { kind: "files"; accept?: string };
  /**
   * Path of the form value relative to the root payload. Dotted paths
   * (`brief.goals`) are split inside the form helpers.
   */
  path: string;
};

const COMMON_OPENING: LetterField[] = [
  {
    id: "name",
    step: 1,
    eyebrow: "Start",
    prompt: "What name should we address you by?",
    helper: "First name or preferred name is fine.",
    field: { kind: "text", placeholder: "Your name" },
    path: "name",
    required: true,
  },
  {
    id: "email",
    step: 2,
    eyebrow: "Contact",
    prompt: "Where should we send our response?",
    helper: "We typically reply within two business days.",
    field: { kind: "email" },
    path: "email",
    required: true,
  },
  {
    id: "phone",
    step: 3,
    eyebrow: "Contact",
    prompt: "What's the best phone number to reach you on?",
    helper: "Include your country code if you are outside Pakistan.",
    field: { kind: "tel" },
    path: "phone",
    required: true,
  },
  {
    id: "company",
    step: 4,
    eyebrow: "Context",
    prompt: "Which company or brand is this for?",
    helper: "You can skip this for personal projects.",
    field: { kind: "text", placeholder: "Optional" },
    path: "company",
  },
];

export const REQUIRED_PHONE_FIELD: LetterField = {
  id: "phone",
  step: 3,
  eyebrow: "Contact",
  prompt: "What's the best phone number to reach you on?",
  helper: "Include your country code if you are outside Pakistan.",
  field: { kind: "tel" },
  path: "phone",
  required: true,
};

export function ensurePhoneField(fields: LetterField[]): LetterField[] {
  const hasPhone = fields.some((field) => field.path === "phone" || field.id === "phone");
  if (hasPhone) {
    return fields.map((field) =>
      field.path === "phone" || field.id === "phone" ? { ...field, required: true } : field,
    );
  }

  const emailIndex = fields.findIndex((field) => field.path === "email" || field.id === "email");
  const insertIndex = emailIndex >= 0 ? emailIndex + 1 : Math.min(1, fields.length);
  return [
    ...fields.slice(0, insertIndex),
    REQUIRED_PHONE_FIELD,
    ...fields.slice(insertIndex),
  ];
}

function ensureField(fields: LetterField[], field: LetterField, afterIds: string[]) {
  const hasField = fields.some((entry) => entry.id === field.id || entry.path === field.path);
  if (hasField) return fields;

  const afterIndex = fields.findLastIndex((entry) => afterIds.includes(entry.id) || afterIds.includes(entry.path));
  const insertIndex = afterIndex >= 0 ? afterIndex + 1 : fields.length;

  return [...fields.slice(0, insertIndex), field, ...fields.slice(insertIndex)];
}

function canonicalizeField(
  pipeline: (typeof PIPELINE_TYPES)[number],
  field: LetterField,
): LetterField {
  const id = field.id;
  const path = field.path;

  if (id === "phone" || path === "phone") {
    return { ...field, id: "phone", path: "phone", field: { kind: "tel" }, required: true };
  }

  if (pipeline === "design_idea" && (id === "goals" || path === "goals")) {
    return { ...field, id: "goals", path: "brief.goals", required: true };
  }

  if (pipeline === "design_scratch" && (id === "requirements" || path === "requirements")) {
    return { ...field, id: "requirements", path: "brief.requirements", required: true };
  }

  if (pipeline === "manufacture_existing" && (id === "cadLinks" || path === "cadLinks")) {
    return { ...field, id: "cadLinks", path: "brief.cadLinks", required: true };
  }

  return field;
}

/** Lean signals: stage, scale, timing (season/drops go in the timeline line). */
const COMMON_SIGNALS: LetterField[] = [
  {
    id: "brand_stage",
    step: 4,
    eyebrow: "Stage",
    prompt: "What stage is the brand at?",
    field: {
      kind: "chips",
      options: [
        { value: "emerging", label: "Emerging" },
        { value: "established", label: "Established" },
        { value: "heritage", label: "Heritage" },
      ],
    },
    path: "signals.brand_stage",
  },
  {
    id: "volume_bracket",
    step: 5,
    eyebrow: "Scale",
    prompt: "What's your estimated production volume?",
    field: {
      kind: "chips",
      options: [
        { value: "lt_500", label: "< 500" },
        { value: "500_2k", label: "500 – 2k" },
        { value: "2k_10k", label: "2k – 10k" },
        { value: "gt_10k", label: "10k+" },
      ],
    },
    path: "signals.volume_bracket",
  },
  {
    id: "timeline",
    step: 6,
    eyebrow: "Timing",
    prompt: "When does this need to land?",
    helper: "Dates, season, drops — whatever anchors you.",
    field: { kind: "text", placeholder: "e.g. SS27 ship · March drop" },
    path: "timeline",
  },
];

const COMMON_CLOSING: LetterField[] = [
  {
    id: "budget",
    step: 7,
    eyebrow: "Commercial",
    prompt: "What's your budget range?",
    helper: "Ballpark is enough — helps us respond seriously.",
    field: { kind: "text", placeholder: "e.g. $10–25k development" },
    path: "budgetRange",
  },
  {
    id: "files",
    step: 8,
    eyebrow: "Artifacts",
    prompt: "Files worth a look?",
    helper: "PDFs, imagery, packs — optional.",
    field: { kind: "files", accept: ".pdf,.png,.jpg,.jpeg,.heic,.zip" },
    path: "files",
  },
  {
    id: "notes",
    step: 9,
    eyebrow: "Anything else",
    prompt: "Last beat?",
    field: {
      kind: "textarea",
      placeholder: "Stakeholders, risks, links we missed.",
      rows: 4,
    },
    path: "notes",
  },
];

const IDEA_BRIEF: LetterField[] = [
  {
    id: "goals",
    step: 3.5,
    eyebrow: "03 / Brief",
    prompt: "Tell us what's in the air.",
    helper: "What is the idea trying to be? What does it solve, or feel like?",
    field: { kind: "textarea", placeholder: "Free-form. A paragraph is plenty.", rows: 6 },
    path: "brief.goals",
    required: true,
  },
  {
    id: "constraints",
    step: 3.6,
    eyebrow: "04 / Brief",
    prompt: "Any constraints we should respect?",
    field: { kind: "textarea", placeholder: "Materials, budgets, supply, ethics.", rows: 4 },
    path: "brief.constraints",
  },
];

const SCRATCH_BRIEF: LetterField[] = [
  {
    id: "requirements",
    step: 3.5,
    eyebrow: "03 / Brief",
    prompt: "What does the spec ask for?",
    field: { kind: "textarea", placeholder: "What the piece must do, season targets, fits.", rows: 6 },
    path: "brief.requirements",
    required: true,
  },
  {
    id: "brandAssets",
    step: 3.6,
    eyebrow: "04 / Brief",
    prompt: "Any brand language we should hold?",
    field: { kind: "textarea", placeholder: "Tone, colour, codes you want kept.", rows: 4 },
    path: "brief.brandAssets",
  },
  {
    id: "specs",
    step: 3.7,
    eyebrow: "05 / Brief",
    prompt: "Are there reference specs or fits to start from?",
    field: { kind: "textarea", placeholder: "Tech-pack notes, fit blocks, etc.", rows: 4 },
    path: "brief.specs",
  },
];

const MANUFACTURE_BRIEF: LetterField[] = [
  {
    id: "cadLinks",
    step: 3.5,
    eyebrow: "03 / Brief",
    prompt: "Where do the CADs and tech-packs live?",
    helper: "Drive, Dropbox, WeTransfer — paste the links one per line.",
    field: { kind: "textarea", placeholder: "https://…", rows: 4 },
    path: "brief.cadLinks",
    required: true,
  },
  {
    id: "materials",
    step: 3.6,
    eyebrow: "04 / Brief",
    prompt: "Materials specified?",
    field: { kind: "textarea", placeholder: "Mills, certifications, finishes.", rows: 3 },
    path: "brief.materials",
  },
  {
    id: "quantities",
    step: 3.7,
    eyebrow: "05 / Brief",
    prompt: "Quantities and SKU split?",
    field: { kind: "text", placeholder: "e.g. 1,200 units across 4 SKUs" },
    path: "brief.quantities",
  },
  {
    id: "shippingRegion",
    step: 3.8,
    eyebrow: "06 / Brief",
    prompt: "Where does it ship?",
    field: { kind: "text", placeholder: "Country, region, port" },
    path: "brief.shippingRegion",
  },
];

export function normalizePipelineFields(
  pipeline: (typeof PIPELINE_TYPES)[number],
  fields: LetterField[],
): LetterField[] {
  const primaryBrief =
    pipeline === "design_idea"
      ? IDEA_BRIEF[0]
      : pipeline === "design_scratch"
        ? SCRATCH_BRIEF[0]
        : MANUFACTURE_BRIEF[0];

  const normalized = ensureField(
    ensurePhoneField(fields.map((field) => canonicalizeField(pipeline, field))),
    primaryBrief,
    ["company", "phone", "email"],
  );

  return normalized.map((field, index) => ({ ...field, step: index + 1 }));
}

export function getLetterFields(
  pipeline: (typeof PIPELINE_TYPES)[number],
): LetterField[] {
  const brief =
    pipeline === "design_idea"
      ? IDEA_BRIEF
      : pipeline === "design_scratch"
        ? SCRATCH_BRIEF
        : MANUFACTURE_BRIEF;
  return normalizePipelineFields(pipeline, [
    ...COMMON_OPENING,
    ...brief,
    ...COMMON_SIGNALS,
    ...COMMON_CLOSING,
  ]);
}

/**
 * The form-state shape held by the LoomReel client. We keep it loose so
 * deeply-nested updates are simple, then validate with Zod on submit.
 */
export type StartFormState = {
  pipelineType: (typeof PIPELINE_TYPES)[number] | null;
  name: string;
  email: string;
  company: string;
  phone: string;
  country: string;
  timeline: string;
  budgetRange: string;
  notes: string;
  files: { name: string; type?: string; size?: number; path?: string; file?: File }[];
  brief: {
    goals?: string;
    constraints?: string;
    requirements?: string;
    brandAssets?: string;
    specs?: string;
    cadLinks?: string;
    materials?: string;
    quantities?: string;
    shippingRegion?: string;
    inspirations?: string[];
    collaboration?: string;
  };
  signals: {
    brand_stage?: "emerging" | "established" | "heritage";
    calendar_tier?: "ss" | "fw" | "drop_led" | "continuous";
    volume_bracket?: "lt_500" | "500_2k" | "2k_10k" | "gt_10k";
    role?: "ceo" | "designer" | "sourcing" | "producer" | "other";
    preferred_channel?: "email" | "call" | "in_person";
    priorities?: ("material" | "certification" | "labour" | "packaging")[];
  };
};

export const initialFormState = (): StartFormState => ({
  pipelineType: null,
  name: "",
  email: "",
  company: "",
  phone: "",
  country: "",
  timeline: "",
  budgetRange: "",
  notes: "",
  files: [],
  brief: {},
  signals: {},
});

/**
 * Translate the loose form state into the strict `intakePayloadSchema` the
 * server expects. The server schema is the contract; this is just a
 * type-safe adapter so the UI can stay flexible.
 */
export function toIntakePayload(state: StartFormState) {
  if (!state.pipelineType) throw new Error("pipelineType is required");

  // Clean signals: only include if there are actual values (not just empty object).
  // `signals` values are typed as a union of literal strings + arrays, but at
  // runtime the form may seed them with `""`, so we cast through `unknown` to
  // satisfy the strict comparison.
  const cleanSignals = Object.fromEntries(
    Object.entries(state.signals).filter(([, v]) => {
      const raw = v as unknown;
      return raw !== undefined && raw !== null && raw !== "";
    })
  ) as StartFormState["signals"];
  const hasSignals = Object.keys(cleanSignals).length > 0;

  const base = {
    name: state.name.trim(),
    email: state.email.trim(),
    company: state.company.trim() || undefined,
    phone: state.phone.trim() || undefined,
    country: state.country.trim() || undefined,
    timeline: state.timeline.trim() || undefined,
    budgetRange: state.budgetRange.trim() || undefined,
    notes: state.notes.trim() || undefined,
    files: state.files.length ? state.files : undefined,
    signals: hasSignals ? cleanSignals : undefined,
  };

  switch (state.pipelineType) {
    case "design_idea": {
      const goals = state.brief.goals?.trim() ?? "";
      // Filter inspirations to remove empty strings
      const inspirations = state.brief.inspirations?.filter(Boolean);
      return {
        ...base,
        pipelineType: "design_idea" as const,
        brief: {
          goals,
          constraints: state.brief.constraints?.trim() || undefined,
          inspirations: inspirations?.length ? inspirations : undefined,
        },
      };
    }
    case "design_scratch": {
      const requirements = state.brief.requirements?.trim() ?? "";
      return {
        ...base,
        pipelineType: "design_scratch" as const,
        brief: {
          requirements,
          brandAssets: state.brief.brandAssets?.trim() || undefined,
          specs: state.brief.specs?.trim() || undefined,
          collaboration: state.brief.collaboration?.trim() || undefined,
        },
      };
    }
    case "manufacture_existing": {
      const links = (state.brief.cadLinks ?? "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      return {
        ...base,
        pipelineType: "manufacture_existing" as const,
        brief: {
          cadLinks: links.length > 0 ? links : undefined,
          materials: state.brief.materials?.trim() || undefined,
          quantities: state.brief.quantities?.trim() || undefined,
          shippingRegion: state.brief.shippingRegion?.trim() || undefined,
        },
      };
    }
  }
}
