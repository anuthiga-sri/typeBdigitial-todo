import type { Todo } from "@typebdigital/shared";

async function readJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const json: unknown = await response.json();
  if (!response.ok) {
    const message =
      json &&
      typeof json === "object" &&
      "error" in json &&
      json.error &&
      typeof (json as { error: { message?: string } }).error === "object"
        ? (json as { error: { message?: string } }).error.message
        : response.statusText;
    throw new Error(message ?? "Request failed");
  }
  if (
    json &&
    typeof json === "object" &&
    "error" in json &&
    (json as { error?: unknown }).error
  ) {
    const message = (json as { error: { message?: string } }).error.message;
    throw new Error(message ?? "Request failed");
  }
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }
  throw new Error("Unexpected response");
}

export type ListTodosParams = {
  sortBy: "dueDate" | "priority";
  order: "asc" | "desc";
};

export async function listTodos(
  params: ListTodosParams,
): Promise<Todo[]> {
  const search = new URLSearchParams({
    filter: "all",
    sortBy: params.sortBy,
    order: params.order,
  });
  const response = await fetch(`/api/todos?${search}`);
  return readJson<Todo[]>(response);
}

export type CreateTodoRequest = {
  title: string;
  description?: string;
  completed?: boolean;
  dueDate: string;
  parentTaskId?: string | null;
  priority: Todo["priority"];
};

export async function createTodo(
  body: CreateTodoRequest,
): Promise<Todo> {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return readJson<Todo>(response);
}

export type UpdateTodoRequest = Partial<{
  title: string;
  description: string;
  dueDate: string;
  parentTaskId: string | null;
  priority: Todo["priority"];
}>;

export async function updateTodo(
  id: string,
  body: UpdateTodoRequest,
): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return readJson<Todo>(response);
}

export async function setTodoCompleted(
  id: string,
  completed: boolean,
): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}/complete`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  return readJson<Todo>(response);
}

export async function deleteTodo(id: string): Promise<void> {
  const response = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });
  await readJson<void>(response);
}

export async function getTodo(id: string): Promise<Todo> {
  const response = await fetch(`/api/todos/${id}`);
  return readJson<Todo>(response);
}
