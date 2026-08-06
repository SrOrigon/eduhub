import { getSessionUser } from "@/lib/auth";
import { getGrades, getStudents } from "@/lib/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateGradeForm } from "@/components/forms/create-grade-form";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";

function gradeVariant(value: number) {
  if (value >= 7) return "success" as const;
  if (value >= 5) return "warning" as const;
  return "danger" as const;
}

export default async function NotasPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role === "student") redirect("/dashboard/aluno");

  const [grades, students] = await Promise.all([
    getGrades(user.schoolId),
    getStudents(user.schoolId),
  ]);

  const studentOptions = students.map((s) => ({
    id: s.id,
    name: s.user.fullName,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Notas" description="Lançamento com crédito automático de XP">
        <CreateGradeForm students={studentOptions} />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Notas lançadas ({grades.length})</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {grades.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Nenhuma nota lançada"
              description="Use o botão acima para registrar a primeira nota."
            />
          ) : (
            <ResponsiveTable minWidth="40rem" caption="Notas lançadas na escola">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th scope="col" className="pb-3 pr-4">Aluno</th>
                  <th scope="col" className="pb-3 pr-4">Disciplina</th>
                  <th scope="col" className="hidden pb-3 pr-4 sm:table-cell">Período</th>
                  <th scope="col" className="hidden pb-3 pr-4 md:table-cell">Data</th>
                  <th scope="col" className="pb-3">Nota</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((grade) => (
                  <tr key={grade.id} className="border-b border-slate-100">
                    <td className="max-w-[8rem] py-3 pr-4 sm:max-w-none">{grade.student.user.fullName}</td>
                    <td className="py-3 pr-4">{grade.subject}</td>
                    <td className="hidden py-3 pr-4 sm:table-cell">{grade.period}</td>
                    <td className="hidden py-3 pr-4 md:table-cell">
                      {grade.createdAt.toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3">
                      <Badge variant={gradeVariant(grade.value)}>
                        {grade.value.toFixed(1)} / {grade.maxValue}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </ResponsiveTable>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
