"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { useAdminSession } from "@/components/admin/AdminSession";
import { adminFetch } from "@/lib/admin/api";
import { QuestionCard } from "./QuestionCard";
import { QuestionModal } from "./QuestionModal";
import type { PipelineType } from "@/lib/pipelines/types";
import type { PipelineQuestion, PipelineRow } from "@/app/api/admin/pipelines/route";
import { cn } from "@/lib/utils";

type Props = {
  pipelineType: PipelineType;
};

const DEFAULT_QUESTIONS: Record<PipelineType, PipelineQuestion[]> = {
  design_idea: [
    {
      id: "name",
      eyebrow: "Start",
      prompt: "What name should we address you by?",
      helper: "First name or preferred name is fine.",
      field: { kind: "text", placeholder: "Your name" },
      path: "name",
      required: true,
    },
    {
      id: "email",
      eyebrow: "Contact",
      prompt: "Where should we send our response?",
      helper: "We typically reply within two business days.",
      field: { kind: "email" },
      path: "email",
      required: true,
    },
    {
      id: "goals",
      eyebrow: "Brief",
      prompt: "What are you trying to achieve?",
      helper: "Describe your vision in a few sentences.",
      field: { kind: "textarea", placeholder: "Your goals...", rows: 4 },
      path: "brief.goals",
      required: true,
    },
  ],
  design_scratch: [
    {
      id: "name",
      eyebrow: "Start",
      prompt: "What name should we address you by?",
      field: { kind: "text", placeholder: "Your name" },
      path: "name",
      required: true,
    },
    {
      id: "email",
      eyebrow: "Contact",
      prompt: "Where should we send our response?",
      field: { kind: "email" },
      path: "email",
      required: true,
    },
    {
      id: "requirements",
      eyebrow: "Brief",
      prompt: "What does the spec ask for?",
      field: { kind: "textarea", placeholder: "Requirements...", rows: 4 },
      path: "brief.requirements",
      required: true,
    },
  ],
  manufacture_existing: [
    {
      id: "name",
      eyebrow: "Start",
      prompt: "What name should we address you by?",
      field: { kind: "text", placeholder: "Your name" },
      path: "name",
      required: true,
    },
    {
      id: "email",
      eyebrow: "Contact",
      prompt: "Where should we send our response?",
      field: { kind: "email" },
      path: "email",
      required: true,
    },
    {
      id: "cadLinks",
      eyebrow: "Brief",
      prompt: "Where do the CADs and tech-packs live?",
      helper: "Drive, Dropbox, WeTransfer — paste the links one per line.",
      field: { kind: "textarea", placeholder: "https://...", rows: 4 },
      path: "brief.cadLinks",
      required: true,
    },
  ],
};

export function PipelineFlowEditor({ pipelineType }: Props) {
  const { authHeaders, status } = useAdminSession();
  const [pipeline, setPipeline] = useState<PipelineRow | null>(null);
  const [questions, setQuestions] = useState<PipelineQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<PipelineQuestion | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const load = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    
    const res = await adminFetch<{ pipeline: PipelineRow | null }>(
      `/api/admin/pipelines/${pipelineType}`,
      { authHeaders: authHeaders() }
    );
    
    if (res.ok) {
      setPipeline(res.data.pipeline);
      const savedQuestions = res.data.pipeline?.questions;
      if (savedQuestions && savedQuestions.length > 0) {
        setQuestions(savedQuestions);
      } else {
        setQuestions(DEFAULT_QUESTIONS[pipelineType] || []);
      }
    } else {
      setError(res.error);
    }
    setLoading(false);
  }, [authHeaders, status, pipelineType]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveQuestions = useCallback(async (newQuestions: PipelineQuestion[]) => {
    if (status !== "authenticated" || saving) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const res = await adminFetch<{ pipeline: PipelineRow }>(
      `/api/admin/pipelines/${pipelineType}`,
      {
        authHeaders: authHeaders(),
        method: "PUT",
        body: JSON.stringify({ questions: newQuestions }),
      }
    );

    setSaving(false);
    
    if (res.ok) {
      setPipeline(res.data.pipeline);
      setSuccess("Pipeline saved successfully");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(res.error);
    }
  }, [authHeaders, status, pipelineType, saving]);

  const handleReorder = (newOrder: PipelineQuestion[]) => {
    setQuestions(newOrder);
  };

  const handleSaveReorder = async () => {
    await saveQuestions(questions);
  };

  const handleEditQuestion = (question: PipelineQuestion) => {
    setEditingQuestion(question);
    setIsAddingNew(false);
  };

  const handleAddQuestion = () => {
    setEditingQuestion({
      id: `question_${Date.now()}`,
      eyebrow: "New",
      prompt: "Your question here",
      field: { kind: "text", placeholder: "Type here..." },
      path: `custom.field_${Date.now()}`,
      required: false,
    });
    setIsAddingNew(true);
  };

  const handleSaveQuestion = async (updated: PipelineQuestion) => {
    let newQuestions: PipelineQuestion[];
    
    if (isAddingNew) {
      newQuestions = [...questions, updated];
    } else {
      newQuestions = questions.map((q) =>
        q.id === updated.id ? updated : q
      );
    }
    
    setQuestions(newQuestions);
    setEditingQuestion(null);
    setIsAddingNew(false);
    await saveQuestions(newQuestions);
  };

  const handleDeleteQuestion = async (id: string) => {
    const newQuestions = questions.filter((q) => q.id !== id);
    setQuestions(newQuestions);
    setEditingQuestion(null);
    await saveQuestions(newQuestions);
  };

  const handleDuplicateQuestion = (question: PipelineQuestion) => {
    const duplicate: PipelineQuestion = {
      ...question,
      id: `${question.id}_copy_${Date.now()}`,
      path: `${question.path}_copy`,
    };
    const index = questions.findIndex((q) => q.id === question.id);
    const newQuestions = [
      ...questions.slice(0, index + 1),
      duplicate,
      ...questions.slice(index + 1),
    ];
    setQuestions(newQuestions);
    void saveQuestions(newQuestions);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-body text-ink/55">Loading pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-[var(--hairline-strong)] bg-[var(--color-terracotta)]/10 px-4 py-3 text-body text-terracotta">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-moss/30 bg-moss/10 px-4 py-3 text-body text-moss">
          {success}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-label text-ink/55">
            {questions.length} question{questions.length !== 1 ? "s" : ""}
          </span>
          {pipeline && (
            <span className="text-label text-ink/45">
              · v{pipeline.version}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSaveReorder}
            disabled={saving}
            className="rounded-full border border-[var(--hairline)] px-4 py-2 text-label text-ink/75 hover:bg-ink/5 transition-colors disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save order"}
          </button>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="rounded-full bg-ink text-stone px-4 py-2 text-label hover:bg-ink/85 transition-colors"
          >
            + Add question
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-ink/20 via-ink/10 to-transparent" />
        
        <Reorder.Group
          axis="y"
          values={questions}
          onReorder={handleReorder}
          className="space-y-3"
        >
          <AnimatePresence>
            {questions.map((question, index) => (
              <Reorder.Item
                key={question.id}
                value={question}
                className="relative"
              >
                <QuestionCard
                  question={question}
                  index={index}
                  total={questions.length}
                  onEdit={() => handleEditQuestion(question)}
                  onDuplicate={() => handleDuplicateQuestion(question)}
                  onDelete={() => handleDeleteQuestion(question.id)}
                />
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>

        {questions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[var(--hairline)] p-12 text-center">
            <p className="text-h3 text-ink">No questions configured</p>
            <p className="text-body text-ink/55 mt-2">
              Add your first question to start building the flow.
            </p>
            <button
              type="button"
              onClick={handleAddQuestion}
              className="mt-6 rounded-full bg-ink text-stone px-5 py-2.5 text-label hover:bg-ink/85 transition-colors"
            >
              Add first question
            </button>
          </div>
        )}
      </div>

      <QuestionModal
        question={editingQuestion}
        isOpen={editingQuestion !== null}
        onClose={() => {
          setEditingQuestion(null);
          setIsAddingNew(false);
        }}
        onSave={handleSaveQuestion}
        onDelete={isAddingNew ? undefined : () => handleDeleteQuestion(editingQuestion?.id ?? "")}
      />
    </div>
  );
}
