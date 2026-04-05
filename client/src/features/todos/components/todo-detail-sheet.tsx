import { zodResolver } from "@hookform/resolvers/zod";
import type { Todo } from "@typebdigital/shared";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/sheet";
import { Textarea } from "@/shared/components/ui/textarea";
import type { ListTodosParams } from "../api/todos-api";
import {
  useDeleteTodoMutation,
  useUpdateTodoMutation,
} from "../hooks/use-todo-mutations";
import { todoFormSchema, type TodoFormValues } from "../domain/todo-form-schema";
import { countDescendants, getRootTodos } from "../domain/todo-tree";

type TodoDetailSheetProps = {
  todo: Todo | null;
  allTodos: Todo[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listParams: ListTodosParams;
};

export function TodoDetailSheet({
  todo,
  allTodos,
  open,
  onOpenChange,
  listParams,
}: TodoDetailSheetProps) {
  const updateMutation = useUpdateTodoMutation(listParams);
  const deleteMutation = useDeleteTodoMutation(listParams);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const form = useForm<TodoFormValues>({
    resolver: zodResolver(todoFormSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      priority: "medium",
      parentTaskId: "",
    },
  });

  useEffect(() => {
    if (!todo) return;
    form.reset({
      title: todo.title,
      description: todo.description ?? "",
      dueDate: format(new Date(todo.dueDate), "yyyy-MM-dd"),
      priority: todo.priority,
      parentTaskId: todo.parentTaskId ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync when selected todo changes
  }, [todo?._id, todo?.updatedAt]);

  useEffect(() => {
    setDeleteDialogOpen(false);
  }, [todo?._id, open]);

  const descendantCount = useMemo(() => {
    if (!todo) return 0;
    return countDescendants(allTodos, todo._id);
  }, [allTodos, todo]);

  const parentSelectOptions = useMemo(() => {
    if (!todo) return [];
    return getRootTodos(allTodos)
      .filter((t) => t._id !== todo._id)
      .slice()
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [allTodos, todo]);

  const historyEntries = useMemo(() => {
    if (!todo) return [];
    return [...todo.history].sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime(),
    );
  }, [todo]);

  if (!todo) return null;

  const handleSubmit = form.handleSubmit((values) => {
    updateMutation.mutate(
      {
        id: todo._id,
        body: {
          title: values.title,
          description: values.description || undefined,
          dueDate: values.dueDate,
          priority: values.priority,
          parentTaskId:
            values.parentTaskId && values.parentTaskId.length > 0
              ? values.parentTaskId
              : null,
        },
      },
      {
        onSuccess: () => {
          toast.success("Task saved");
          onOpenChange(false);
        },
      },
    );
  });

  const dirty = form.formState.isDirty;

  return (
    <>
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this task?</DialogTitle>
            <DialogDescription className="text-left">
              {descendantCount > 0 ? (
                <>
                  This will permanently delete this task and{" "}
                  <span className="font-medium text-foreground">
                    {descendantCount} subtask
                    {descendantCount === 1 ? "" : "s"}
                  </span>
                  . This cannot be undone.
                </>
              ) : (
                <>This task will be permanently removed. This cannot be undone.</>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => {
                deleteMutation.mutate(todo._id, {
                  onSuccess: () => {
                    setDeleteDialogOpen(false);
                    onOpenChange(false);
                  },
                });
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Task details</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="detail-title">Title</Label>
            <Input id="detail-title" {...form.register("title")} />
            {form.formState.errors.title ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-description">Description</Label>
            <Textarea id="detail-description" rows={4} {...form.register("description")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-due">Due</Label>
            <Input
              id="detail-due"
              type="date"
              {...form.register("dueDate")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-priority">Priority</Label>
            <select
              id="detail-priority"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              {...form.register("priority")}
            >
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-parent">Parent task</Label>
            <select
              id="detail-parent"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              {...form.register("parentTaskId")}
            >
              <option value="">None (top-level)</option>
              {parentSelectOptions.map((candidate) => (
                <option key={candidate._id} value={candidate._id}>
                  {candidate.title}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium leading-none">Activity</h3>
            <ul className="max-h-56 space-y-0 overflow-y-auto rounded-md border border-border bg-muted/30 p-3">
              {historyEntries.length === 0 ? (
                <li className="text-sm text-muted-foreground">No activity yet.</li>
              ) : (
                historyEntries.map((entry, index) => (
                  <li
                    key={`${entry.time}-${index}`}
                    className="border-b border-border py-2.5 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(entry.time), "MMM d, yyyy · h:mm a")}
                    </p>
                    <p className="mt-1 text-sm text-foreground">{entry.text}</p>
                  </li>
                ))
              )}
            </ul>
          </div>
          {dirty ? (
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={updateMutation.isPending}>
                Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : null}
          <div className="pt-6">
            <Button
              type="button"
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete task
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
    </>
  );
}
