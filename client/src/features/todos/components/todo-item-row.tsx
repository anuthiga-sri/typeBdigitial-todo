import type { Todo } from "@typebdigital/shared";
import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, PanelRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Separator } from "@/shared/components/ui/separator";
import { cn } from "@/shared/lib/utils";
import {
  getChildrenForParent,
  subtaskProgress,
} from "../domain/todo-tree";
import { TodoDueLabel } from "./todo-due-label";
import { TodoPriorityBadge } from "./todo-priority-badge";

type TodoItemRowProps = {
  todo: Todo;
  allTodos: Todo[];
  depth?: number;
  onToggleCompleted: (id: string, completed: boolean) => void;
  onOpenDetail: (todo: Todo) => void;
  togglePending?: boolean;
};

export function TodoItemRow({
  todo,
  allTodos,
  depth = 0,
  onToggleCompleted,
  onOpenDetail,
  togglePending,
}: TodoItemRowProps) {
  const children = getChildrenForParent(allTodos, todo._id);
  const progress = subtaskProgress(children);
  const [expanded, setExpanded] = useState(false);

  const showProgress = children.length > 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn("space-y-2", depth > 0 && "ml-6 border-l border-border pl-3")}
    >
      <div
        className={cn(
          "flex gap-3 rounded-lg border border-border bg-card p-4 shadow-sm transition-colors",
          depth === 0 && "hover:bg-muted/40",
        )}
      >
        <div className="pt-0.5">
          <Checkbox
            checked={todo.completed}
            disabled={togglePending}
            onCheckedChange={(value) =>
              onToggleCompleted(todo._id, value === true)
            }
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <button
                type="button"
                className="w-full text-left"
                onClick={() => onOpenDetail(todo)}
              >
                <p
                  className={cn(
                    "font-semibold leading-tight text-foreground",
                    todo.completed && "text-muted-foreground line-through",
                  )}
                >
                  {todo.title}
                </p>
                {todo.description ? (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {todo.description}
                  </p>
                ) : null}
              </button>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1 text-right">
              <TodoPriorityBadge priority={todo.priority} />
              <TodoDueLabel dueDateIso={todo.dueDate} completed={todo.completed} />
            </div>
          </div>
          {showProgress ? (
            <div className="space-y-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary/70 transition-all"
                  style={{ width: `${progress.ratio * 100}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {progress.completed} / {progress.total} subtasks
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            {children.length > 0 ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? (
                  <ChevronDown className="mr-1 h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="mr-1 h-3.5 w-3.5" />
                )}
                Subtasks ({children.length})
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => onOpenDetail(todo)}
            >
              <PanelRight className="mr-1 h-3.5 w-3.5" />
              Details
            </Button>
          </div>
        </div>
      </div>
      {children.length > 0 && expanded ? (
        <div className="space-y-2">
          <Separator />
          {children.map((child) => (
            <TodoItemRow
              key={child._id}
              todo={child}
              allTodos={allTodos}
              depth={depth + 1}
              onToggleCompleted={onToggleCompleted}
              onOpenDetail={onOpenDetail}
              togglePending={togglePending}
            />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
