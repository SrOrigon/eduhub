import { getNotifications } from "@/actions/notifications";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { MarkAllReadButton } from "@/components/forms/mark-all-read-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Bell } from "lucide-react";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NotificacoesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { items, unreadCount } = await getNotifications(50);

  return (
    <div className="space-y-6">
      <PageHeader title="Notificações" description={`${unreadCount} não lida(s)`}>
        {unreadCount > 0 && <MarkAllReadButton />}
      </PageHeader>

      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Nenhuma notificação"
          description="Você será avisado sobre notas, missões concluídas e resgates na loja."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 ${n.isRead ? "border-slate-200 bg-white" : "border-indigo-200 bg-indigo-50/40"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{n.title}</p>
                    {!n.isRead && <Badge variant="default">Nova</Badge>}
                  </div>
                  <p className="mt-1 text-slate-600">{n.message}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDate(n.createdAt)}</p>
                </div>
                {n.href && (
                  <Link href={n.href}>
                    <Button size="sm" variant="outline">
                      Abrir
                    </Button>
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
