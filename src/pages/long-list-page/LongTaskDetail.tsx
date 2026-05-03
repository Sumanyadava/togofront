import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAtom } from "jotai";
import { LongTodoContainerAtom, LongTodoJ } from "@/state/state";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Calendar,
  Tag,
  Milestone,
  CheckCircle2,
  Circle,
  ArrowLeft,
  FileText,
} from "lucide-react";

const LongTaskDetail = () => {
  const { containerId, taskId } = useParams();
  const [longTodoArray] = useAtom(LongTodoContainerAtom);
  const [task, setTask] = useState<LongTodoJ | null>(null);
  const [containerName, setContainerName] = useState("");

  useEffect(() => {
    const container = longTodoArray.find((c) => c.id === Number(containerId));
    if (container) {
      setContainerName(container.LongContainerName);
      const found = container.LongTodo.find((t) => t.id === Number(taskId));
      setTask(found ?? null);
    }
  }, [longTodoArray, containerId, taskId]);

  if (!task) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-2xl text-muted-foreground">Task not found.</p>
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back home
          </Button>
        </Link>
      </div>
    );
  }

  const deadlineLabel = task.deadline
    ? format(new Date(task.deadline), "PPP")
    : "No Deadline";

  // Progress bar: % of time elapsed from creation → deadline
  let progressPct = 0;
  if (task.deadline) {
    const created = new Date(task.createedAt).getTime();
    const deadline = new Date(task.deadline).getTime();
    const now = Date.now();
    progressPct = Math.min(
      100,
      Math.max(0, Math.round(((now - created) / (deadline - created)) * 100))
    );
  }

  return (
    <div className="min-h-screen w-full p-6 md:p-10 flex flex-col gap-8">
      {/* Back */}
      <div className="flex items-center gap-3">
        <Link to={`/`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-1 h-4 w-4" />
            {containerName}
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground truncate max-w-xs">
          {task.LongTodoName}
        </span>
      </div>

      {/* Title + status */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {task.completed ? (
            <CheckCircle2 className="h-7 w-7 text-green-500 shrink-0" />
          ) : (
            <Circle className="h-7 w-7 text-muted-foreground shrink-0" />
          )}
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            {task.LongTodoName}
          </h1>
        </div>
        <p className="text-muted-foreground ml-10">
          {task.completed ? "Completed" : "In progress"}
        </p>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-3 ml-1">
        <MetaChip
          icon={<Calendar className="h-4 w-4" />}
          label="Deadline"
          value={deadlineLabel}
          highlight={!task.deadline}
        />
        {task.tag && (
          <MetaChip
            icon={<Tag className="h-4 w-4" />}
            label="Tag"
            value={task.tag}
          />
        )}
        {task.milestone && (
          <MetaChip
            icon={<Milestone className="h-4 w-4" />}
            label="Milestone"
            value={task.milestone}
          />
        )}
        <MetaChip
          icon={<Calendar className="h-4 w-4" />}
          label="Created"
          value={format(new Date(task.createedAt), "PPP")}
        />
      </div>

      {/* Progress bar (only when deadline is set) */}
      {task.deadline && (
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Time elapsed</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                progressPct >= 80
                  ? "bg-red-500"
                  : progressPct >= 50
                  ? "bg-orange-400"
                  : "bg-green-500"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Plan text */}
      {task.planText ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <FileText className="h-4 w-4" />
            Plan / Notes
          </div>
          <div className="whitespace-pre-wrap rounded-lg border bg-muted/40 p-5 text-sm leading-relaxed">

               {task.planText}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground text-sm">
          No plan written yet.
        </div>
      )}
    </div>
  );
};

/* ── Helper ── */
const MetaChip = ({
  icon,
  label,
  value,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div
    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
      highlight ? "border-muted-foreground/40 text-muted-foreground italic" : ""
    }`}
  >
    {icon}
    <span className="text-muted-foreground">{label}:</span>
    <span className="font-medium">{value}</span>
  </div>
);

export default LongTaskDetail;
