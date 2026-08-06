"use client";

import { useActionState, useState } from "react";
import { createExerciseAction } from "@/actions/exercises";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Select, Textarea } from "@/components/ui/form-fields";
import { FormMessage } from "@/components/ui/form-utils";
import { Modal } from "@/components/ui/modal";
import type { QuestionType } from "@/lib/exercises";

interface ClassOption {
  id: string;
  name: string;
}

type DraftQuestion = {
  prompt: string;
  type: QuestionType;
  points: number;
  options: { id: string; text: string; isCorrect: boolean }[];
};

function newQuestion(type: QuestionType = "choice"): DraftQuestion {
  return {
    prompt: "",
    type,
    points: 1,
    options: [
      { id: "a", text: "", isCorrect: true },
      { id: "b", text: "", isCorrect: false },
    ],
  };
}

export function CreateExerciseForm({ classes }: { classes: ClassOption[] }) {
  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()]);

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      formData.set("questionsJson", JSON.stringify(questions));
      const result = await createExerciseAction(formData);
      if (result.success) {
        setOpen(false);
        setQuestions([newQuestion()]);
      }
      return result;
    },
    null
  );

  function updateQuestion(i: number, patch: Partial<DraftQuestion>) {
    setQuestions((qs) => qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q)));
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Novo exercício</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Criar exercício ou prova">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" name="title" required placeholder="Ex.: Prova de Matemática — Frações" />
          </div>
          <div>
            <Label htmlFor="description">Instruções</Label>
            <Textarea id="description" name="description" placeholder="Orientações para os alunos..." />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="kind">Tipo</Label>
              <Select id="kind" name="kind" defaultValue="homework">
                <option value="homework">Exercício de casa</option>
                <option value="exam">Prova</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="classId">Turma</Label>
              <Select id="classId" name="classId" required>
                <option value="">Selecione...</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label htmlFor="maxPoints">Pontuação máxima</Label>
              <Input id="maxPoints" name="maxPoints" type="number" step="0.5" defaultValue={10} required />
            </div>
            <div>
              <Label htmlFor="xpReward">XP ao concluir</Label>
              <Input id="xpReward" name="xpReward" type="number" defaultValue={80} />
            </div>
            <div>
              <Label htmlFor="coinReward">Moedas</Label>
              <Input id="coinReward" name="coinReward" type="number" defaultValue={25} />
            </div>
          </div>
          <div>
            <Label htmlFor="dueDate">Prazo de entrega</Label>
            <Input id="dueDate" name="dueDate" type="datetime-local" />
          </div>

          <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-800">Questões</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setQuestions((qs) => [...qs, newQuestion()])}
              >
                + Questão
              </Button>
            </div>
            {questions.map((q, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-slate-600">#{i + 1}</span>
                  <Select
                    value={q.type}
                    onChange={(e) =>
                      updateQuestion(i, {
                        type: e.target.value as QuestionType,
                        options: e.target.value === "choice" ? newQuestion("choice").options : [],
                      })
                    }
                  >
                    <option value="choice">Múltipla escolha</option>
                    <option value="text">Resposta digitada</option>
                  </Select>
                  <Input
                    type="number"
                    step="0.5"
                    className="w-24"
                    value={q.points}
                    onChange={(e) => updateQuestion(i, { points: parseFloat(e.target.value) || 1 })}
                    aria-label="Pontos da questão"
                  />
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuestions((qs) => qs.filter((_, idx) => idx !== i))}
                    >
                      Remover
                    </Button>
                  )}
                </div>
                <Input
                  value={q.prompt}
                  onChange={(e) => updateQuestion(i, { prompt: e.target.value })}
                  placeholder="Enunciado da questão"
                  required
                />
                {q.type === "choice" &&
                  q.options.map((opt, oi) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${i}`}
                        checked={opt.isCorrect}
                        onChange={() =>
                          updateQuestion(i, {
                            options: q.options.map((o, j) => ({ ...o, isCorrect: j === oi })),
                          })
                        }
                        aria-label="Resposta correta"
                      />
                      <Input
                        value={opt.text}
                        onChange={(e) =>
                          updateQuestion(i, {
                            options: q.options.map((o, j) =>
                              j === oi ? { ...o, text: e.target.value } : o
                            ),
                          })
                        }
                        placeholder={`Alternativa ${String.fromCharCode(65 + oi)}`}
                      />
                    </div>
                  ))}
              </div>
            ))}
          </div>

          <FormMessage message={state} />
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Publicando..." : "Publicar para a turma"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
