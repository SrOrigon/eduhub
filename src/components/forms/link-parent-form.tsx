"use client";

import { useActionState, useState } from "react";
import { linkParentStudentAction } from "@/actions/parents";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";

interface ParentOption {
  id: string;
  name: string;
}

interface StudentOption {
  id: string;
  name: string;
}

export function LinkParentForm({
  parents,
  students,
}: {
  parents: ParentOption[];
  students: StudentOption[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await linkParentStudentAction(formData);
      if (result.success) setOpen(false);
      return result;
    },
    null
  );

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Vincular aluno</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Vincular responsável a aluno">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="parentId">Responsável</Label>
            <Select id="parentId" name="parentId" required>
              <option value="">Selecione...</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
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
            <Label htmlFor="relation">Parentesco</Label>
            <Select id="relation" name="relation" defaultValue="responsavel">
              <option value="mae">Mãe</option>
              <option value="pai">Pai</option>
              <option value="responsavel">Responsável legal</option>
              <option value="avo">Avô/Avó</option>
            </Select>
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.success && <p className="text-sm text-emerald-600">Vínculo criado!</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Salvando..." : "Vincular"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
