import type { Todo } from "@typebdigital/shared";
import { isBefore, isToday, startOfDay } from "date-fns";

function isCalendarOverdue(due: Date, now: Date): boolean {
  return isBefore(startOfDay(due), startOfDay(now));
}

export function getChildrenForParent(
  todos: Todo[],
  parentId: string,
): Todo[] {
  return todos.filter((todo) => todo.parentTaskId === parentId);
}

/** All nested subtasks under `parentId` (not including the parent). */
export function countDescendants(todos: Todo[], parentId: string): number {
  const direct = getChildrenForParent(todos, parentId);
  return direct.reduce(
    (sum, child) => sum + 1 + countDescendants(todos, child._id),
    0,
  );
}

export function getRootTodos(todos: Todo[]): Todo[] {
  return todos.filter((todo) => todo.parentTaskId === null);
}

export function subtaskProgress(children: Todo[]): {
  total: number;
  completed: number;
  ratio: number;
} {
  const total = children.length;
  const completed = children.filter((child) => child.completed).length;
  return {
    total,
    completed,
    ratio: total === 0 ? 0 : completed / total,
  };
}

export function countIncomplete(todos: Todo[]): number {
  return todos.filter((todo) => !todo.completed).length;
}

export type StatusFilter = "all" | "active" | "completed";
export type ScopeFilter = "all" | "high" | "overdue" | "today";

export function applyTodoFilters(
  todos: Todo[],
  status: StatusFilter,
  scope: ScopeFilter,
): Todo[] {
  let next = todos;
  if (status === "active") {
    next = next.filter((todo) => !todo.completed);
  } else if (status === "completed") {
    next = next.filter((todo) => todo.completed);
  }
  const now = new Date();
  if (scope === "high") {
    next = next.filter(
      (todo) => todo.priority === "high" || todo.priority === "urgent",
    );
  } else if (scope === "overdue") {
    next = next.filter(
      (todo) =>
        !todo.completed && isCalendarOverdue(new Date(todo.dueDate), now),
    );
  } else if (scope === "today") {
    next = next.filter((todo) => {
      const due = new Date(todo.dueDate);
      if (isToday(due)) return true;
      return !todo.completed && isCalendarOverdue(due, now);
    });
  }
  return next;
}

export function isDueOverdue(dueDateIso: string, completed: boolean): boolean {
  if (completed) return false;
  return isCalendarOverdue(new Date(dueDateIso), new Date());
}

export function isDueTodayHighlight(dueDateIso: string): boolean {
  return isToday(new Date(dueDateIso));
}
