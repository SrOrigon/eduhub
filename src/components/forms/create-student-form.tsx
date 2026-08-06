"use client";

import { useActionState, useState } from "react";
import { createStudentAction } from "@/actions/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, Select } from "@/components/ui/form-fields";
import { FormMessage } from "@/components/ui/form-utils";
import { Modal } from "@/components/ui/modal";

interface ClassOption {
  id: string;
  name: string;
}

export function CreateStudentForm({ classes }: { classes: ClassOption[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      const result = await createStudentAction(formData);
      if (result.success) setOpen(false);
      return result;
    },
    null
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>+ Novo aluno</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Cadastrar aluno">
        <form action={formAction} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nome completo</Label>
            <Input id="fullName" name="fullName" required />
          </div>
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="enrollmentCode">Matrícula</Label>
            <Input id="enrollmentCode" name="enrollmentCode" required />
          </div>
          <div>
            <Label htmlFor="classId">Turma</Label>
            <Select id="classId" name="classId">
              <option value="">Sem turma</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="password">Senha inicial</Label>
            <Input id="password" name="password" type="password" defaultValue="demo123" />
          </div>
          {state?.error && <FormMessage message={state} />}
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Salvando..." : "Cadastrar"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
