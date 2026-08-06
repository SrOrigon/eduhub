"use client";

import { useActionState, useState } from "react";
import { createGradeAction, SUBJECTS, PERIODS } from "@/actions/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Select } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";

interface StudentOption {
  id: string;
  name: string;
}

export function CreateGradeForm({ students }: { students: StudentOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createGradeAction(formData);
      if (result.success) setOpen(false);
      return result;
    },
    null
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Lançar nota</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Lançar nota">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="studentId">Aluno</Label>
            <Select id="studentId" name="studentId" required>
              <option value="">Selecione...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="subject">Disciplina</Label>
            <Select id="subject" name="subject" required>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="value">Nota (0-10)</Label>
            <Input id="value" name="value" type="number" step="0.1" min="0" max="10" required />
          </div>
          <div>
            <Label htmlFor="period">Período</Label>
            <Select id="period" name="period" required>
              {PERIODS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </Select>
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.success && <p className="text-sm text-emerald-600">Nota lançada! XP creditado automaticamente.</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Salvando..." : "Lançar nota"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
