"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { LoomReel } from "./LoomReel";
import { LetterStep } from "./LetterStep";
import { LetterCompletion } from "./LetterCompletion";
import {
  getLetterFields,
  initialFormState,
  startPayloadSchema,
  toIntakePayload,
  type StartFormState,
} from "@/lib/start/schema";
import { trackStart } from "@/lib/start/analytics";
import { captureAttribution, captureDevice } from "@/lib/start/signals";
import type { PipelineType } from "@/lib/pipelines/types";

/**
 * Top-level /start orchestrator.
 *
 * The page exists in three phases:
 *   1. The Loom Reel — chip-pick over a single ambient film.
 *   2. The Letter   — one-question-per-screen, with View Transitions.
 *   3. Completion   — sealed letter / sent confirmation.
 *
 * State lives in this single component because it's all genuinely shared:
 * the form payload, the pipeline branching, the submit state, and the
 * "where am I in the flow" cursor. The only state that doesn't is media
 * + analytics, which read from the browser directly.
 */

type Phase = "reel" | "letter" | "complete";

function setPath(state: StartFormState, path: string, value: unknown): StartFormState {
  const segments = path.split(".");
  if (segments.length === 1) {
    return { ...state, [segments[0]]: value } as StartFormState;
  }
  const [head, ...rest] = segments;
  const child = (state as unknown as Record<string, unknown>)[head] ?? {};
  return {
    ...state,
    [head]: setPath(child as StartFormState, rest.join("."), value),
  } as StartFormState;
}

function getPath(state: StartFormState, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, state);
}

export function StartFlow() {
  const [phase, setPhase] = useState<Phase>("reel");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<StartFormState>(() => initialFormState());
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Initialised in an effect — `cacheComponents` mode forbids
  // non-deterministic values (Date.now / new Date / Math.random) during
  // initial render of a Client Component without a Suspense boundary.
  const stepStartRef = useRef<number>(0);

  const fields = useMemo(
    () => (form.pipelineType ? getLetterFields(form.pipelineType) : []),
    [form.pipelineType],
  );

  useEffect(() => {
    stepStartRef.current = Date.now();
  }, [step]);

  const onPickPipeline = useCallback((pipeline: PipelineType) => {
    setForm((current) => ({ ...current, pipelineType: pipeline }));
    setStep(0);
    setPhase("letter");
    trackStart("letter_started", { pipeline });
  }, []);

  const onChange = useCallback((path: string, value: unknown) => {
    setError(null);
    setForm((current) => setPath(current, path, value));
  }, []);

  const onBack = useCallback(() => {
    setError(null);
    if (step === 0) {
      // Return to pipeline selection (LoomReel)
      setPhase("reel");
      trackStart("letter_back_to_reel", { pipeline: form.pipelineType });
    } else {
      setStep(step - 1);
    }
  }, [step, form.pipelineType]);

  const onNext = useCallback(async () => {
    if (phase !== "letter") return;
    const field = fields[step];
    if (!field) return;
    const value = getPath(form, field.path);
    if (
      field.required &&
      (value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim().length === 0) ||
        (Array.isArray(value) && value.length === 0))
    ) {
      setError("This one is required.");
      return;
    }
    if (field.id === "email" && typeof value === "string") {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      if (!ok) {
        setError("That email doesn't look right.");
        return;
      }
    }

    trackStart("letter_step_complete", {
      step: step + 1,
      prompt: field.id,
      ms_in_step: Date.now() - stepStartRef.current,
    });

    if (step < fields.length - 1) {
      setStep(step + 1);
      return;
    }

    // Final step → submit.
    setSubmitting(true);
    setError(null);
    try {
      const enriched: StartFormState = {
        ...form,
        // attribution + device captured client-side at submit time.
      };
      const payload = toIntakePayload(enriched);
      const attribution = captureAttribution();
      const device = captureDevice();

      // Build the final payload - signals from toIntakePayload already handles
      // empty object → undefined conversion, don't overwrite it.
      const finalPayload = {
        ...payload,
        attribution,
        device,
      };

      const validated = startPayloadSchema.safeParse(finalPayload);
      if (!validated.success) {
        const issue = validated.error.issues[0];
        const fieldPath = issue?.path?.join(".") || "";
        const message = issue?.message ?? "Some fields need another look.";
        console.error("Validation failed:", { fieldPath, message, issues: validated.error.issues });
        setError(fieldPath ? `${message} (${fieldPath})` : message);
        setSubmitting(false);
        return;
      }

      const res = await fetch("/api/public/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validated.data),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          body?.error || body?.message || `Something went wrong (${res.status}).`;
        trackStart("intake_submit_failed", { status: res.status, message });
        setError(message);
        setSubmitting(false);
        return;
      }

      trackStart("intake_submitted", { pipeline: form.pipelineType });
      setSubmitting(false);
      setPhase("complete");
    } catch (err) {
      trackStart("intake_submit_failed", {
        message: err instanceof Error ? err.message : String(err),
      });
      setError(err instanceof Error ? err.message : "Couldn't reach the studio.");
      setSubmitting(false);
    }
  }, [phase, step, fields, form]);

  // Inform the funnel if the user closes the tab mid-letter.
  useEffect(() => {
    if (phase !== "letter") return;
    const handler = () => {
      const field = fields[step];
      trackStart("letter_dropoff", {
        step: step + 1,
        prompt: field?.id,
        ms_in_step: Date.now() - stepStartRef.current,
      });
    };
    window.addEventListener("pagehide", handler);
    return () => window.removeEventListener("pagehide", handler);
  }, [phase, step, fields]);

  if (phase === "reel") {
    return <LoomReel onPick={onPickPipeline} />;
  }

  if (phase === "complete") {
    return <LetterCompletion form={form} />;
  }

  const field = fields[step];
  if (!field) return null;

  return (
    <AnimatePresence mode="wait">
      <LetterStep
        key={field.id}
        field={field}
        state={form}
        index={step + 1}
        total={fields.length}
        onChange={onChange}
        onNext={onNext}
        onBack={onBack}
        error={error}
        submitting={submitting}
      />
    </AnimatePresence>
  );
}
