"use client";

import { useActionState } from "react";
import { deleteHomeTaskAction } from "@/actions/home-tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

type TaskRow = {
  id: string;
  title: string;
  status: string;
  xpReward: number;
  coinReward: number;
  completedAt: Date | null;
  student: { user: { fullName: string } };
};

function DeleteTaskButton({ taskId }: { taskId: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => deleteHomeTaskAction(formData),
    null
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="taskId" value={taskId} />
      <Button type="submit" variant="ghost" size="sm" disabled={pending}>
        {pending ? "..." : "Remover"}
      </Button>
      {state && typeof state === "object" && "error" in state && state.error && (
        <p className="text-xs text-red-600">{String(state.error)}</p>
      )}
    </form>
  );
}

export function ParentHomeTasksPanel({ tasks }: { tasks: TaskRow[] }) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nenhuma tarefa de casa criada ainda. Use o botão acima para definir afazeres.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li
          key={t.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
        >
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900">
              {t.title}{" "}
              <span className="font-normal text-slate-500">· {t.student.user.fullName}</span>
            </p>
            <p className="text-xs text-slate-500">
              +{t.xpReward} XP · {t.coinReward} moedas
              {t.completedAt && ` · Concluída ${formatDate(t.completedAt)}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={t.status === "completed" ? "success" : "warning"}>
              {t.status === "completed" ? "Feita" : "Pendente"}
            </Badge>
            {t.status === "pending" && <DeleteTaskButton taskId={t.id} />}
          </div>
        </li>
      ))}
    </ul>
  );
}
