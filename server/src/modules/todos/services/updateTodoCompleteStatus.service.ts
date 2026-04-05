import type { Todo } from "@typebdigital/shared";
import { Types } from "mongoose";
import { HttpError } from "../../../common/errors/httpError.js";
import { TodoModel } from "../todo.model.js";
import type { SetTodoCompletedPayload } from "../todo.dto.js";
import { serializeTodoDocument } from "../todo.serializer.js";
import { reconcileParentCompletion } from "./reconcileParentTodo.service.js";

const MARK_COMPLETE_HISTORY_MESSAGE = "Marked complete";
const MARK_INCOMPLETE_HISTORY_MESSAGE = "Marked incomplete";

async function completeDirectIncompleteSubtasks(
  parentMongoId: Types.ObjectId,
): Promise<void> {
  const children = await TodoModel.find({
    parentTaskId: parentMongoId,
    completed: false,
  }).exec();
  for (const child of children) {
    child.completed = true;
    child.history.push({ text: MARK_COMPLETE_HISTORY_MESSAGE });
    await child.save();
  }
}

export async function setTodoCompleted(
  id: string,
  payload: SetTodoCompletedPayload,
): Promise<Todo> {
  const document = await TodoModel.findById(id).exec();
  if (!document) {
    throw new HttpError(404, "Todo not found");
  }
  if (document.completed === payload.completed) {
    return serializeTodoDocument(document);
  }
  document.completed = payload.completed;
  document.history.push({
    text: payload.completed
      ? MARK_COMPLETE_HISTORY_MESSAGE
      : MARK_INCOMPLETE_HISTORY_MESSAGE,
  });
  await document.save();
  if (payload.completed) {
    await completeDirectIncompleteSubtasks(document._id as Types.ObjectId);
  }
  const parentIdBefore = document.parentTaskId;
  if (parentIdBefore) {
    await reconcileParentCompletion(parentIdBefore.toString());
  }
  return serializeTodoDocument(document);
}
