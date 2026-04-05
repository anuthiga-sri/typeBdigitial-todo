import type { Todo } from "@typebdigital/shared";
import { HttpError } from "../../../common/errors/httpError.js";
import { TodoModel } from "../todo.model.js";
import { serializeTodoDocument } from "../todo.serializer.js";

export async function getTodoById(id: string): Promise<Todo> {
  const document = await TodoModel.findById(id).exec();
  if (!document) {
    throw new HttpError(404, "Todo not found");
  }
  return serializeTodoDocument(document);
}
