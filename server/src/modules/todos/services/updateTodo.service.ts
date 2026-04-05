import type { Todo } from "@typebdigital/shared";
import { Types } from "mongoose";
import { HttpError } from "../../../common/errors/httpError.js";
import { TodoModel } from "../todo.model.js";
import type { UpdateTodoPayload } from "../todo.dto.js";
import { serializeTodoDocument } from "../todo.serializer.js";
import { reconcileParentCompletion } from "./reconcileParentTodo.service.js";

const UPDATE_HISTORY_MESSAGE = "Updated task";

export async function updateTodo(
  id: string,
  payload: UpdateTodoPayload,
): Promise<Todo> {
  const document = await TodoModel.findById(id).exec();
  if (!document) {
    throw new HttpError(404, "Todo not found");
  }
  if (payload.title !== undefined) document.title = payload.title;
  if (payload.description !== undefined) document.description = payload.description;
  if (payload.dueDate !== undefined) document.dueDate = payload.dueDate;
  if (payload.priority !== undefined) document.priority = payload.priority;
  if (payload.parentTaskId !== undefined) {
    document.parentTaskId =
      payload.parentTaskId === null
        ? null
        : new Types.ObjectId(payload.parentTaskId);
  }
  document.history.push({ text: UPDATE_HISTORY_MESSAGE });
  await document.save();
  const parentIdBefore = document.parentTaskId;
  if (parentIdBefore) {
    await reconcileParentCompletion(parentIdBefore.toString());
  }
  return serializeTodoDocument(document);
}
