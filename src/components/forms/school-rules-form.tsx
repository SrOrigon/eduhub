"use client";

import { useActionState, useState } from "react";
import { updateSchoolSettingsAction } from "@/actions/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Textarea } from "@/components/ui/form-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SchoolSettings } from "@/lib/school-settings";

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium text-slate-900">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}

export function SchoolRulesForm({ initial }: { initial: SchoolSettings }) {
  const [settings, setSettings] = useState<SchoolSettings>(initial);
  const [tab, setTab] = useState<"xp" | "academic" | "notify" | "exercises" | "shop">("xp");

  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      formData.set("settingsJson", JSON.stringify(settings));
      return await updateSchoolSettingsAction(formData);
    },
    null
  );

  const tabs = [
    { id: "xp" as const, label: "XP e missões" },
    { id: "academic" as const, label: "Acadêmico" },
    { id: "notify" as const, label: "Notificações" },
    { id: "exercises" as const, label: "Exercícios" },
    { id: "shop" as const, label: "Loja" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regras da escola</CardTitle>
        <p className="text-sm text-slate-500">
          Tudo aqui alimenta notas, frequência, exercícios, missões, loja e alertas — uma engrenagem só.
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                tab === t.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form action={formAction} className="space-y-4">
          {tab === "xp" && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="perGradePoint">XP por ponto de nota</Label>
                <Input
                  id="perGradePoint"
                  type="number"
                  value={settings.xp.perGradePoint}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      xp: { ...s.xp, perGradePoint: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="gradeBonusThreshold">Nota para bônus</Label>
                <Input
                  id="gradeBonusThreshold"
                  type="number"
                  step="0.1"
                  value={settings.xp.gradeBonusThreshold}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      xp: { ...s.xp, gradeBonusThreshold: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="gradeBonus">XP bônus de nota alta</Label>
                <Input
                  id="gradeBonus"
                  type="number"
                  value={settings.xp.gradeBonus}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      xp: { ...s.xp, gradeBonus: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="attendancePresent">XP presença</Label>
                <Input
                  id="attendancePresent"
                  type="number"
                  value={settings.xp.attendancePresent}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      xp: { ...s.xp, attendancePresent: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="attendanceLate">XP atraso</Label>
                <Input
                  id="attendanceLate"
                  type="number"
                  value={settings.xp.attendanceLate}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      xp: { ...s.xp, attendanceLate: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="xpPerLevel">XP por nível</Label>
                <Input
                  id="xpPerLevel"
                  type="number"
                  value={settings.xp.xpPerLevel}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      xp: { ...s.xp, xpPerLevel: Number(e.target.value) || 300 },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="badgeUnlock">XP ao ganhar badge</Label>
                <Input
                  id="badgeUnlock"
                  type="number"
                  value={settings.xp.badgeUnlock}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      xp: { ...s.xp, badgeUnlock: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="missionXp">XP padrão de missão</Label>
                <Input
                  id="missionXp"
                  type="number"
                  value={settings.missions.defaultXp}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      missions: { ...s.missions, defaultXp: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="missionCoins">Moedas padrão de missão</Label>
                <Input
                  id="missionCoins"
                  type="number"
                  value={settings.missions.defaultCoins}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      missions: { ...s.missions, defaultCoins: Number(e.target.value) || 0 },
                    }))
                  }
                />
              </div>
            </div>
          )}

          {tab === "academic" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="maxGrade">Nota máxima</Label>
                  <Input
                    id="maxGrade"
                    type="number"
                    step="0.5"
                    value={settings.academic.maxGrade}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        academic: { ...s.academic, maxGrade: Number(e.target.value) || 10 },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="passGrade">Nota de aprovação (UI)</Label>
                  <Input
                    id="passGrade"
                    type="number"
                    step="0.5"
                    value={settings.academic.passGrade}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        academic: { ...s.academic, passGrade: Number(e.target.value) || 7 },
                      }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="subjects">Disciplinas (uma por linha)</Label>
                <Textarea
                  id="subjects"
                  rows={6}
                  value={settings.academic.subjects.join("\n")}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      academic: {
                        ...s.academic,
                        subjects: e.target.value
                          .split("\n")
                          .map((x) => x.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="periods">Períodos (um por linha)</Label>
                <Textarea
                  id="periods"
                  rows={4}
                  value={settings.academic.periods.join("\n")}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      academic: {
                        ...s.academic,
                        periods: e.target.value
                          .split("\n")
                          .map((x) => x.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                />
              </div>
            </div>
          )}

          {tab === "notify" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                checked={settings.notifications.parentsOnGrade}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, parentsOnGrade: v },
                  }))
                }
                label="Avisar pais sobre notas"
              />
              <Toggle
                checked={settings.notifications.parentsOnAbsence}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, parentsOnAbsence: v },
                  }))
                }
                label="Avisar pais sobre faltas/atrasos"
              />
              <Toggle
                checked={settings.notifications.studentOnAbsence}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, studentOnAbsence: v },
                  }))
                }
                label="Avisar aluno sobre falta"
              />
              <Toggle
                checked={settings.notifications.parentsOnMission}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, parentsOnMission: v },
                  }))
                }
                label="Avisar pais sobre missões"
              />
              <Toggle
                checked={settings.notifications.parentsOnExercise}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, parentsOnExercise: v },
                  }))
                }
                label="Avisar pais sobre novos exercícios"
              />
              <Toggle
                checked={settings.notifications.parentsOnExerciseGraded}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, parentsOnExerciseGraded: v },
                  }))
                }
                label="Avisar pais quando exercício for corrigido"
              />
              <Toggle
                checked={settings.notifications.parentsOnShop}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, parentsOnShop: v },
                  }))
                }
                label="Avisar pais sobre resgates na loja"
              />
              <Toggle
                checked={settings.notifications.teacherOnSubmission}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    notifications: { ...s.notifications, teacherOnSubmission: v },
                  }))
                }
                label="Avisar professor em novas entregas"
              />
            </div>
          )}

          {tab === "exercises" && (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Toggle
                  checked={settings.exercises.autoGradeEnabled}
                  onChange={(v) =>
                    setSettings((s) => ({
                      ...s,
                      exercises: { ...s.exercises, autoGradeEnabled: v },
                    }))
                  }
                  label="Auto-corrigir quiz de múltipla escolha"
                  description="XP e moedas na hora quando todas as questões forem objetivas"
                />
                <Toggle
                  checked={settings.exercises.postGradeToBulletin}
                  onChange={(v) =>
                    setSettings((s) => ({
                      ...s,
                      exercises: { ...s.exercises, postGradeToBulletin: v },
                    }))
                  }
                  label="Lançar nota do exercício no boletim"
                  description="Cria registro de nota ao corrigir"
                />
              </div>
              <p className="text-sm text-slate-600">Presets do wizard (rótulo · XP · moedas · pontos):</p>
              {settings.exercises.presets.map((p, i) => (
                <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Input
                    value={p.label}
                    onChange={(e) =>
                      setSettings((s) => {
                        const presets = [...s.exercises.presets];
                        presets[i] = { ...presets[i], label: e.target.value };
                        return { ...s, exercises: { ...s.exercises, presets } };
                      })
                    }
                    aria-label="Rótulo do preset"
                  />
                  <Input
                    type="number"
                    value={p.xp}
                    onChange={(e) =>
                      setSettings((s) => {
                        const presets = [...s.exercises.presets];
                        presets[i] = { ...presets[i], xp: Number(e.target.value) || 0 };
                        return { ...s, exercises: { ...s.exercises, presets } };
                      })
                    }
                    aria-label="XP"
                  />
                  <Input
                    type="number"
                    value={p.coins}
                    onChange={(e) =>
                      setSettings((s) => {
                        const presets = [...s.exercises.presets];
                        presets[i] = { ...presets[i], coins: Number(e.target.value) || 0 };
                        return { ...s, exercises: { ...s.exercises, presets } };
                      })
                    }
                    aria-label="Moedas"
                  />
                  <Input
                    type="number"
                    value={p.points}
                    onChange={(e) =>
                      setSettings((s) => {
                        const presets = [...s.exercises.presets];
                        presets[i] = { ...presets[i], points: Number(e.target.value) || 0 };
                        return { ...s, exercises: { ...s.exercises, presets } };
                      })
                    }
                    aria-label="Pontos"
                  />
                </div>
              ))}
            </div>
          )}

          {tab === "shop" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Toggle
                checked={settings.shop.teachersCanFulfill}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    shop: { ...s.shop, teachersCanFulfill: v },
                  }))
                }
                label="Professores podem marcar prêmio como entregue"
              />
              <Toggle
                checked={settings.shop.requireStock}
                onChange={(v) =>
                  setSettings((s) => ({
                    ...s,
                    shop: { ...s.shop, requireStock: v },
                  }))
                }
                label="Exigir estoque numérico para resgatar"
                description="Itens sem estoque definido ficam bloqueados"
              />
            </div>
          )}

          {state?.error && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="text-sm text-emerald-600" role="status">
              Regras salvas — já valem em todo o sistema.
            </p>
          )}

          <Button type="submit" disabled={pending} size="lg">
            {pending ? "Salvando..." : "Salvar regras da escola"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
