export interface HealthResponse {
  ok: boolean;
}

export interface ApiSuccess<T> {
  data: T;
}

export interface ApiError {
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export type TodoPriority = "low" | "medium" | "high" | "urgent";

export interface TodoHistoryEntry {
  time: string;
  text: string;
}

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: string;
  parentTaskId: string | null;
  priority: TodoPriority;
  history: TodoHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}
