import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, FileEdit, Sparkles } from "lucide-react";

export type ExerciseStudentStatus = "pending" | "submitted" | "graded" | "overdue";

const config: Record<
  ExerciseStudentStatus,
  { label: string; variant: "default" | "success" | "warning" | "danger"; icon: typeof Clock }
> = {
  pending: { label: "Faça agora", variant: "warning", icon: FileEdit },
  submitted: { label: "Aguardando correção", variant: "default", icon: Clock },
  graded: { label: "Corrigido", variant: "success", icon: CheckCircle2 },
  overdue: { label: "Prazo encerrado", variant: "danger", icon: Clock },
};

export function ExerciseStatusBadge({
  status,
  score,
  maxScore,
  className,
}: {
  status: ExerciseStudentStatus;
  score?: number | null;
  maxScore?: number | null;
  className?: string;
}) {
  const { label, variant, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className={cn("gap-1", className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status === "graded" && score != null && maxScore != null
        ? `${label}: ${score.toFixed(1)}/${maxScore.toFixed(1)}`
        : label}
    </Badge>
  );
}

export function ExerciseRewardPills({
  xp,
  coins,
  points,
  className,
}: {
  xp: number;
  coins: number;
  points?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {points != null && (
        <Badge variant="default">{points} pts</Badge>
      )}
      {xp > 0 && (
        <Badge variant="success" className="gap-1">
          <Sparkles className="h-3 w-3" aria-hidden="true" />+{xp} XP
        </Badge>
      )}
      {coins > 0 && <Badge variant="warning">+{coins} moedas</Badge>}
    </div>
  );
}

export function getStudentExerciseStatus(
  submission: { status: string } | undefined,
  dueDate: Date | null,
  hasSubmitted: boolean
): ExerciseStudentStatus {
  if (submission?.status === "graded") return "graded";
  if (submission?.status === "submitted" || hasSubmitted) return "submitted";
  if (dueDate && new Date() > dueDate) return "overdue";
  return "pending";
}
