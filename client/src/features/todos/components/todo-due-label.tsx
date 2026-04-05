import { format } from "date-fns";
import { cn } from "@/shared/lib/utils";
import {
  isDueOverdue,
  isDueTodayHighlight,
} from "../domain/todo-tree";

export function TodoDueLabel({
  dueDateIso,
  completed,
}: {
  dueDateIso: string;
  completed: boolean;
}) {
  const overdue = isDueOverdue(dueDateIso, completed);
  const today = isDueTodayHighlight(dueDateIso);
  return (
    <span
      className={cn(
        "text-xs text-muted-foreground",
        overdue && "font-medium text-destructive",
        today && !overdue && "rounded bg-muted px-1.5 py-0.5 text-foreground",
      )}
    >
      {format(new Date(dueDateIso), "MMM d, yyyy")}
    </span>
  );
}
