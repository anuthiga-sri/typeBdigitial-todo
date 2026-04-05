import type { Todo } from "@typebdigital/shared";
import { TodoModel } from "../todo.model.js";
import type { CreateTodoPayload } from "../todo.dto.js";
import { serializeTodoDocument } from "../todo.serializer.js";

const CREATION_HISTORY_MESSAGE = "Created the task";
const PARENT_SUBTASK_CREATED_MESSAGE = "A subtask was added";

export async function createTodo(
  payload: CreateTodoPayload,
): Promise<Todo> {
  const initialHistoryEntries = [{ text: CREATION_HISTORY_MESSAGE }];
  const createdTodoDocument = await TodoModel.create({
    title: payload.title,
    description: payload.description,
    completed: payload.completed,
    dueDate: payload.dueDate,
    parentTaskId: payload.parentTaskId,
    priority: payload.priority,
    history: initialHistoryEntries,
  });
  if (createdTodoDocument.parentTaskId) {
    const parent = await TodoModel.findById(
      createdTodoDocument.parentTaskId,
    ).exec();
    if (parent) {
      parent.history.push({ text: PARENT_SUBTASK_CREATED_MESSAGE });
      await parent.save();
    }
  }
  return serializeTodoDocument(createdTodoDocument);
}
