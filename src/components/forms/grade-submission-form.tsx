"use client";

import { useActionState, useState } from "react";
import { gradeSubmissionAction } from "@/actions/exercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/form-fields";
import { FormMessage } from "@/components/ui/form-utils";
import { Badge } from "@/components/ui/badge";
import { parseOptions } from "@/lib/exercises";

type Answer = {
  id: string;
  questionId: string;
  textAnswer: string | null;
  selectedOptionId: string | null;
  pointsAwarded: number | null;
};

type Question = {
  id: string;
  prompt: string;
  type: string;
  options: string | null;
  points: number;
};

export function GradeSubmissionForm({
  submissionId,
  studentName,
  questions,
  answers,
  feedback: initialFeedback,
}: {
  submissionId: string;
  studentName: string;
  questions: Question[];
  answers: Answer[];
  feedback?: string | null;
}) {
  const [grades, setGrades] = useState<Record<string, number>>(() => {
    const g: Record<string, number> = {};
    for (const a of answers) {
      g[a.questionId] = a.pointsAwarded ?? 0;
    }
    return g;
  });

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const gradesJson = JSON.stringify(
        Object.fromEntries(
          Object.entries(grades).map(([questionId, points]) => [
            questionId,
            { points, isCorrect: points > 0 },
          ])
        )
      );
      formData.set("submissionId", submissionId);
      formData.set("gradesJson", gradesJson);
      return (await gradeSubmissionAction(formData)) ?? null;
    },
    null
  );

  const total = Object.values(grades).reduce((s, v) => s + v, 0);
  const max = questions.reduce((s, q) => s + q.points, 0);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-slate-900">{studentName}</p>
        <Badge variant="default">{total.toFixed(1)} / {max} pts</Badge>
      </div>

      {questions.map((q, i) => {
        const answer = answers.find((a) => a.questionId === q.id);
        const opts = parseOptions(q.options);
        return (
          <div key={q.id} className="space-y-2 border-t border-slate-100 pt-3">
            <p className="text-sm font-medium">{i + 1}. {q.prompt}</p>
            <p className="text-sm text-slate-600">
              Resposta:{" "}
              {q.type === "choice"
                ? opts.find((o) => o.id === answer?.selectedOptionId)?.text ?? "—"
                : answer?.textAnswer ?? "—"}
            </p>
            {q.type === "choice" && (
              <p className="text-xs text-slate-500">
                Gabarito: {opts.find((o) => o.isCorrect)?.text ?? "—"}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Label htmlFor={`pts-${q.id}`} className="shrink-0 text-sm">
                Pontos (máx. {q.points})
              </Label>
              <Input
                id={`pts-${q.id}`}
                type="number"
                step="0.5"
                min={0}
                max={q.points}
                value={grades[q.id] ?? 0}
                onChange={(e) =>
                  setGrades((prev) => ({
                    ...prev,
                    [q.id]: Math.min(q.points, Math.max(0, parseFloat(e.target.value) || 0)),
                  }))
                }
                className="w-24"
              />
            </div>
          </div>
        );
      })}

      <div>
        <Label htmlFor="feedback">Feedback ao aluno</Label>
        <Textarea id="feedback" name="feedback" defaultValue={initialFeedback ?? ""} placeholder="Comentários opcionais..." />
      </div>

      <FormMessage message={state} />
      {state?.success && (
        <p className="text-sm text-emerald-700" role="status">Nota lançada! XP e moedas creditados proporcionalmente.</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Lançar nota e finalizar correção"}
      </Button>
    </form>
  );
}
