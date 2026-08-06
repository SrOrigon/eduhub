"use client";

import { useActionState } from "react";
import { updateSchoolAction } from "@/actions/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/form-fields";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SchoolSettingsFormProps {
  school: { name: string; city: string | null; state: string | null };
}

export function SchoolSettingsForm({ school }: SchoolSettingsFormProps) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) => {
      return await updateSchoolAction(formData);
    },
    null
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da escola</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="max-w-md space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input id="name" name="name" defaultValue={school.name} required />
          </div>
          <div>
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" name="city" defaultValue={school.city ?? ""} />
          </div>
          <div>
            <Label htmlFor="state">Estado</Label>
            <Input id="state" name="state" defaultValue={school.state ?? ""} maxLength={2} />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          {state?.success && <p className="text-sm text-emerald-600">Salvo com sucesso!</p>}
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
