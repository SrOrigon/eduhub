import { getSessionUser } from "@/lib/auth";
import { getSchoolSettings } from "@/lib/school-settings";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SchoolCalendarWidget } from "@/components/school/school-calendar-widget";
import { formatSchoolDays, getTodaySchoolStatus } from "@/lib/school-calendar";
import { formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";

export default async function CalendarioPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const settings = await getSchoolSettings(user.schoolId);
  const today = getTodaySchoolStatus(settings);

  const allItems = [
    ...settings.calendar.holidays.map((h) => ({
      date: h.date,
      label: h.label,
      kind: "holiday" as const,
    })),
    ...settings.calendar.events.map((e) => ({
      date: e.date,
      label: e.label,
      kind: e.kind ?? ("event" as const),
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendário escolar"
        description={settings.branding.tagline || "Datas, horários e eventos da instituição"}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Status de hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{today.label}</p>
            {today.hours && <p className="mt-1 text-sm text-slate-600">Horário: {today.hours}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Período letivo</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{formatDate(settings.calendar.yearStart)}</p>
            <p>até {formatDate(settings.calendar.yearEnd)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-500">Dias de aula</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{formatSchoolDays(settings.calendar.schoolDays)}</p>
            <p className="mt-1 text-sm text-slate-600">
              {settings.calendar.classStartTime} – {settings.calendar.classEndTime}
            </p>
          </CardContent>
        </Card>
      </div>

      <SchoolCalendarWidget settings={settings} />

      <Card>
        <CardHeader>
          <CardTitle>Todos os feriados e eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {allItems.length === 0 ? (
            <p className="text-slate-500">Nenhum item cadastrado. Configure em Configurações.</p>
          ) : (
            <ul className="space-y-2">
              {allItems.map((item, i) => (
                <li
                  key={`${item.date}-${i}`}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 py-3 text-sm"
                >
                  <span className="font-medium">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.kind === "holiday" ? "warning" : "default"}>
                      {item.kind === "holiday"
                        ? "Feriado"
                        : item.kind === "exam"
                          ? "Prova"
                          : item.kind === "meeting"
                            ? "Reunião"
                            : "Evento"}
                    </Badge>
                    <span className="text-slate-600">{formatDate(item.date)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
