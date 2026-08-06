"use client";

import { useActionState, useState } from "react";
import { submitExerciseAction } from "@/actions/exercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/form-fields";
import { FormMessage } from "@/components/ui/form-utils";
import { parseOptions } from "@/lib/exercises";

type Question = {
  id: string;
  prompt: string;
  type: string;
  options: string | null;
  points: number;
};

export function ExerciseSubmitForm({
  exerciseId,
  questions,
  readOnly = false,
  existingAnswers,
}: {
  exerciseId: string;
  questions: Question[];
  readOnly?: boolean;
  existingAnswers?: Record<string, { textAnswer?: string | null; selectedOptionId?: string | null }>;
}) {
  const [answers, setAnswers] = useState<Record<string, { textAnswer?: string; selectedOptionId?: string }>>(
    () => {
      const init: Record<string, { textAnswer?: string; selectedOptionId?: string }> = {};
      for (const q of questions) {
        const ex = existingAnswers?.[q.id];
        init[q.id] = {
          textAnswer: ex?.textAnswer ?? undefined,
          selectedOptionId: ex?.selectedOptionId ?? undefined,
        };
      }
      return init;
    }
  );

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      formData.set("exerciseId", exerciseId);
      formData.set("answersJson", JSON.stringify(answers));
      return (await submitExerciseAction(formData)) ?? null;
    },
    null
  );

  if (readOnly) {
    return (
      <div className="space-y-4">
        {questions.map((q, i) => {
          const a = existingAnswers?.[q.id];
          const opts = parseOptions(q.options);
          return (
            <div key={q.id} className="rounded-xl border border-slate-200 p-4">
              <p className="font-medium">{i + 1}. {q.prompt}</p>
              <p className="mt-2 text-sm text-slate-600">
                {q.type === "choice"
                  ? opts.find((o) => o.id === a?.selectedOptionId)?.text ?? "—"
                  : a?.textAnswer ?? "—"}
              </p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-slate-200 p-4">
          <Label className="text-base font-medium">
            {i + 1}. {q.prompt} <span className="text-slate-500">({q.points} pt{q.points !== 1 ? "s" : ""})</span>
          </Label>
          {q.type === "choice" ? (
            <div className="mt-3 space-y-2">
              {parseOptions(q.options).map((opt) => (
                <label key={opt.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={opt.id}
                    checked={answers[q.id]?.selectedOptionId === opt.id}
                    onChange={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: { ...prev[q.id], selectedOptionId: opt.id },
                      }))
                    }
                    required
                  />
                  <span>{opt.text}</span>
                </label>
              ))}
            </div>
          ) : (
            <Textarea
              className="mt-3"
              value={answers[q.id]?.textAnswer ?? ""}
              onChange={(e) =>
                setAnswers((prev) => ({
                  ...prev,
                  [q.id]: { ...prev[q.id], textAnswer: e.target.value },
                }))
              }
              placeholder="Digite sua resposta..."
              required
            />
          )}
        </div>
      ))}
      <FormMessage message={state} />
      {state?.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">
          Respostas enviadas! Aguarde a correção do professor.
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? "Enviando..." : "Enviar respostas"}
      </Button>
    </form>
  );
}
