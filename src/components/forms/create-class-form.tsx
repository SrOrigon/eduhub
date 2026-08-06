"use client";

import { useActionState, useState } from "react";
import { createClassAction } from "@/actions/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Select } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";

interface TeacherOption {
  id: string;
  fullName: string;
}

export function CreateClassForm({ teachers }: { teachers: TeacherOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createClassAction(formData);
      if (result.success) setOpen(false);
      return result;
    },
    null
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Nova turma</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Cadastrar turma">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da turma</Label>
            <Input id="name" name="name" placeholder="8º Ano A" required />
          </div>
          <div>
            <Label htmlFor="gradeLevel">Série</Label>
            <Input id="gradeLevel" name="gradeLevel" placeholder="8" required />
          </div>
          <div>
            <Label htmlFor="year">Ano letivo</Label>
            <Input id="year" name="year" type="number" defaultValue={2026} required />
          </div>
          <div>
            <Label htmlFor="teacherId">Professor responsável</Label>
            <Select id="teacherId" name="teacherId">
              <option value="">Nenhum</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.fullName}</option>
              ))}
            </Select>
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Salvando..." : "Cadastrar turma"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
