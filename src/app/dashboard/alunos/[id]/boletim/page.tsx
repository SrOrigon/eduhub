import { getSessionUser } from "@/lib/auth";
import { getStudentById, getSchool } from "@/lib/queries";
import { getChildForParent } from "@/actions/parents";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { formatDate } from "@/lib/utils";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { PrintBoletimButton } from "@/components/forms/print-boletim-button";

export default async function BoletimPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;

  if (user.role === "parent") {
    const link = await getChildForParent(user.id, id);
    if (!link) notFound();
  }

  if (user.role === "student") {
    const own = await prisma.student.findFirst({ where: { userId: user.id } });
    if (!own || own.id !== id) notFound();
  }

  const [student, school] = await Promise.all([
    getStudentById(id, user.schoolId),
    getSchool(user),
  ]);
  if (!student) notFound();

  const backHref =
    user.role === "parent"
      ? `/dashboard/responsavel/filho/${id}`
      : user.role === "student"
        ? "/dashboard/aluno"
        : `/dashboard/alunos/${id}`;

  const backLabel =
    user.role === "parent"
      ? "← Voltar ao filho"
      : user.role === "student"
        ? "← Voltar ao meu perfil"
        : "← Voltar ao perfil";

  const avgGrade =
    student.grades.length > 0
      ? student.grades.reduce((s, g) => s + g.value, 0) / student.grades.length
      : 0;

  const periods = [...new Set(student.grades.map((g) => g.period))];

  return (
    <div className="boletim-print mx-auto w-full max-w-3xl space-y-6 bg-white p-4 text-slate-900 sm:p-8 print:p-0">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <Link href={backHref} className="text-sm font-medium text-indigo-600 hover:underline">
          {backLabel}
        </Link>
        <PrintBoletimButton />
      </div>

      <header className="border-b-2 border-indigo-600 pb-4 text-center">
        <h1 className="page-title text-indigo-700">{school?.name ?? "EduHub"}</h1>
        <p className="text-sm text-slate-600">Boletim Escolar · {new Date().getFullYear()}</p>
      </header>

      <section className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
        <div>
          <p><strong>Aluno:</strong> {student.user.fullName}</p>
          <p><strong>Matrícula:</strong> {student.enrollmentCode}</p>
        </div>
        <div>
          <p><strong>Turma:</strong> {student.classGroup?.name ?? "—"}</p>
          <p><strong>E-mail:</strong> {student.user.email}</p>
        </div>
      </section>

      <section className="min-w-0">
        <h2 className="mb-3 font-semibold text-indigo-700">Desempenho Acadêmico</h2>
        {student.grades.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-slate-600">
            Nenhuma nota lançada ainda.
          </p>
        ) : (
          <ResponsiveTable minWidth="28rem" className="border-collapse">
            <thead>
              <tr className="bg-indigo-50">
                <th className="border p-2 text-left">Disciplina</th>
                {periods.map((p) => (
                  <th key={p} className="border p-2 text-center">{p}</th>
                ))}
                <th className="border p-2 text-center">Média</th>
              </tr>
            </thead>
            <tbody>
              {[...new Set(student.grades.map((g) => g.subject))].map((subject) => {
                const subjectGrades = student.grades.filter((g) => g.subject === subject);
                const avg = subjectGrades.reduce((s, g) => s + g.value, 0) / subjectGrades.length;
                return (
                  <tr key={subject}>
                    <td className="border p-2">{subject}</td>
                    {periods.map((period) => {
                      const g = subjectGrades.find((gr) => gr.period === period);
                      return (
                        <td key={period} className="border p-2 text-center">
                          {g ? g.value.toFixed(1) : "—"}
                        </td>
                      );
                    })}
                    <td className="border p-2 text-center font-semibold">{avg.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 font-semibold">
                <td className="border p-2" colSpan={periods.length + 1}>Média Geral</td>
                <td className="border p-2 text-center">{avgGrade.toFixed(1)}</td>
              </tr>
            </tfoot>
          </ResponsiveTable>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 text-center text-sm sm:grid-cols-3">
        <div className="rounded-lg border p-3">
          <p className="text-slate-500">Nível gamificação</p>
          <p className="text-xl font-bold text-indigo-600">{student.level}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-slate-500">XP Total</p>
          <p className="text-xl font-bold">{student.xpTotal}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-slate-500">Conquistas</p>
          <p className="text-xl font-bold">{student.studentBadges.length}</p>
        </div>
      </section>

      {student.studentBadges.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold text-indigo-700">Badges</h2>
          <div className="flex flex-wrap gap-2">
            {student.studentBadges.map((sb) => (
              <Badge key={sb.id} variant="default">{sb.badge.name}</Badge>
            ))}
          </div>
        </section>
      )}

      <footer className="border-t pt-4 text-center text-xs text-slate-500">
        Emitido em {formatDate(new Date())} · EduHub — Gestão + Gamificação
      </footer>
    </div>
  );
}
