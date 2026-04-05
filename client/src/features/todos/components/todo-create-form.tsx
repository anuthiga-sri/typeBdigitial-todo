import { zodResolver } from "@hookform/resolvers/zod";
import type { Todo } from "@typebdigital/shared";
import { format } from "date-fns";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import type { ListTodosParams } from "../api/todos-api";
import { todoFormSchema, type TodoFormValues } from "../domain/todo-form-schema";
import { useCreateTodoMutation } from "../hooks/use-todo-mutations";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";

export function TodoCreateForm({
  listParams,
  roots,
  onCreated,
  onCancel,
}: {
  listParams: ListTodosParams;
  roots: Todo[];
  onCreated?: () => void;
  onCancel?: () => void;
}) {
  const createMutation = useCreateTodoMutation(listParams);
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
    form.setValue("dueDate", format(new Date(), "yyyy-MM-dd"));
  }, [form]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-base font-semibold">Add task</CardTitle>
        {onCancel ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            createMutation.mutate(
              {
                title: values.title,
                description: values.description || undefined,
                dueDate: values.dueDate,
                priority: values.priority,
                completed: false,
                parentTaskId: values.parentTaskId || undefined,
              },
              {
                onSuccess: () => {
                  form.reset();
                  form.setValue("dueDate", format(new Date(), "yyyy-MM-dd"));
                  onCreated?.();
                },
              },
            );
          })}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="create-title">Title</Label>
              <Input id="create-title" {...form.register("title")} />
              {form.formState.errors.title ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.title.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="create-desc">Description</Label>
              <Textarea
                id="create-desc"
                rows={2}
                {...form.register("description")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-due">Due</Label>
              <Input id="create-due" type="date" {...form.register("dueDate")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-priority">Priority</Label>
              <select
                id="create-priority"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                {...form.register("priority")}
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="urgent">urgent</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="create-parent">Parent task (optional)</Label>
              <select
                id="create-parent"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                {...form.register("parentTaskId")}
              >
                <option value="">None</option>
                {roots.map((root) => (
                  <option key={root._id} value={root._id}>
                    {root.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <Button type="submit" disabled={createMutation.isPending}>
            Add task
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
