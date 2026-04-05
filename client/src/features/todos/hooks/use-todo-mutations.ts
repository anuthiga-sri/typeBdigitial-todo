import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Todo } from "@typebdigital/shared";
import {
  createTodo,
  deleteTodo,
  setTodoCompleted,
  updateTodo,
  type CreateTodoRequest,
  type ListTodosParams,
  type UpdateTodoRequest,
} from "../api/todos-api";
import { todoQueryKeys } from "../api/query-keys";

export function useCreateTodoMutation(listParams: ListTodosParams) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTodoRequest) => createTodo(body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: todoQueryKeys.list(listParams.sortBy, listParams.order),
      });
      toast.success("Task created");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Could not create task");
    },
  });
}

export function useUpdateTodoMutation(listParams: ListTodosParams) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTodoRequest }) =>
      updateTodo(id, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: todoQueryKeys.list(listParams.sortBy, listParams.order),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Could not update task");
    },
  });
}

export function useToggleTodoCompletedMutation(listParams: ListTodosParams) {
  const queryClient = useQueryClient();
  const listKey = todoQueryKeys.list(listParams.sortBy, listParams.order);
  return useMutation({
    mutationFn: ({
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
    }) => setTodoCompleted(id, completed),
    onMutate: async ({ id, completed }) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueryData<Todo[]>(listKey);
      if (previous) {
        queryClient.setQueryData<Todo[]>(
          listKey,
          previous.map((todo) =>
            todo._id === id ? { ...todo, completed } : todo,
          ),
        );
      }
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(listKey, context.previous);
      }
      toast.error("Could not update status. Try again.");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: listKey });
    },
  });
}

export function useDeleteTodoMutation(listParams: ListTodosParams) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTodo(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: todoQueryKeys.list(listParams.sortBy, listParams.order),
      });
      toast.success("Task deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Could not delete task");
    },
  });
}
