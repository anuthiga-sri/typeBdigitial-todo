import { useQuery } from "@tanstack/react-query";
import type { Todo } from "@typebdigital/shared";
import { AlertCircle, Plus } from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { listTodos, type ListTodosParams } from "../api/todos-api";
import { todoQueryKeys } from "../api/query-keys";
import {
  applyTodoFilters,
  countIncomplete,
  getRootTodos,
  type ScopeFilter,
  type StatusFilter,
} from "../domain/todo-tree";
import { useToggleTodoCompletedMutation } from "../hooks/use-todo-mutations";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { TodoCreateForm } from "./todo-create-form";
import { TodoItemRow } from "./todo-item-row";

const TodoDetailSheet = lazy(() =>
  import("./todo-detail-sheet").then((module) => ({
    default: module.TodoDetailSheet,
  })),
);

function TodoListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((key) => (
        <div key={key} className="space-y-2 rounded-lg border border-border p-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function TodoListPage() {
  const [sortBy, setSortBy] = useState<"dueDate" | "priority">("dueDate");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>("all");
  const [detailTodo, setDetailTodo] = useState<Todo | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addFormOpen, setAddFormOpen] = useState(false);

  const listParams: ListTodosParams = useMemo(
    () => ({ sortBy, order }),
    [sortBy, order],
  );

  const query = useQuery({
    queryKey: todoQueryKeys.list(listParams.sortBy, listParams.order),
    queryFn: () => listTodos(listParams),
  });

  const toggleMutation = useToggleTodoCompletedMutation(listParams);

  const filteredTodos = useMemo(() => {
    if (!query.data) return [];
    return applyTodoFilters(query.data, statusFilter, scopeFilter);
  }, [query.data, statusFilter, scopeFilter]);

  const rootTodos = useMemo(
    () => getRootTodos(filteredTodos),
    [filteredTodos],
  );

  const rootsForParentSelect = useMemo(() => {
    if (!query.data) return [];
    return getRootTodos(query.data);
  }, [query.data]);

  const leftCount = countIncomplete(filteredTodos);

  const openDetail = (todo: Todo) => {
    setDetailTodo(todo);
    setSheetOpen(true);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 pb-16">
      <header className="space-y-1">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          {!addFormOpen ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => setAddFormOpen(true)}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add task
            </Button>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          {leftCount} task{leftCount === 1 ? "" : "s"} left
        </p>
      </header>

      {addFormOpen ? (
        <TodoCreateForm
          listParams={listParams}
          roots={rootsForParentSelect}
          onCreated={() => setAddFormOpen(false)}
          onCancel={() => setAddFormOpen(false)}
        />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs
          value={scopeFilter}
          onValueChange={(value) => setScopeFilter(value as ScopeFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="high">High priority</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="today">Today</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-muted-foreground" htmlFor="sort-by">
          Sort
        </label>
        <select
          id="sort-by"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value as "dueDate" | "priority")
          }
        >
          <option value="dueDate">Due date</option>
          <option value="priority">Priority</option>
        </select>
        <select
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          value={order}
          onChange={(event) =>
            setOrder(event.target.value as "asc" | "desc")
          }
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {query.isLoading ? <TodoListSkeleton /> : null}

      {query.isError ? (
        <div
          className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4"
          role="alert"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4" />
            {query.error instanceof Error
              ? query.error.message
              : "Could not load tasks"}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void query.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {query.isSuccess && rootTodos.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
          No tasks yet. Use Add task to create one.
        </p>
      ) : null}

      {query.isSuccess && rootTodos.length > 0 ? (
        <div className="space-y-4">
          {rootTodos.map((todo) => (
            <TodoItemRow
              key={todo._id}
              todo={todo}
              allTodos={query.data ?? []}
              onToggleCompleted={(id, completed) =>
                toggleMutation.mutate({ id, completed })
              }
              onOpenDetail={openDetail}
              togglePending={toggleMutation.isPending}
            />
          ))}
        </div>
      ) : null}

      <Suspense fallback={null}>
        <TodoDetailSheet
          todo={detailTodo}
          allTodos={query.data ?? []}
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            if (!open) setDetailTodo(null);
          }}
          listParams={listParams}
        />
      </Suspense>
    </div>
  );
}
