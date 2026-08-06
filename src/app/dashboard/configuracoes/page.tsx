import { getSessionUser } from "@/lib/auth";
import { getSchool } from "@/lib/queries";
import { SchoolSettingsForm } from "@/components/forms/school-settings-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";

export default async function ConfiguracoesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin" && user.role !== "director") redirect("/dashboard");

  const school = await getSchool(user);

  if (!school) {
    return <p>Escola não configurada.</p>;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Gerencie os dados da sua instituição" />

      <SchoolSettingsForm school={school} />

      <Card>
        <CardHeader>
          <CardTitle>Sistema</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>Banco de dados: SQLite local (prisma/dev.db)</p>
          <p>Versão: EduHub 0.2.0 — Fase 2 funcional</p>
          <p>Comandos úteis:</p>
          <ul className="list-inside list-disc">
            <li><code>npm run db:seed</code> — repopular dados demo</li>
            <li><code>npm run db:reset</code> — resetar banco</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
