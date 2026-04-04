import type { Todo } from "@typebdigital/shared";
import type { HydratedDocument } from "mongoose";
import type { Types } from "mongoose";

type TodoDocumentFields = {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: Date;
  parentTaskId: Types.ObjectId | null;
  priority: string;
  history: { time: Date; text: string }[];
  createdAt: Date;
  updatedAt: Date;
};

export function serializeTodoDocument(
  mongoDocument: HydratedDocument<TodoDocumentFields>,
): Todo {
  const plainObject = mongoDocument.toObject();
  return {
    _id: plainObject._id.toString(),
    title: plainObject.title,
    description: plainObject.description,
    completed: plainObject.completed,
    dueDate: plainObject.dueDate.toISOString(),
    parentTaskId: plainObject.parentTaskId
      ? plainObject.parentTaskId.toString()
      : null,
    priority: plainObject.priority as Todo["priority"],
    history: (plainObject.history ?? []).map((historyEntry) => ({
      time: historyEntry.time.toISOString(),
      text: historyEntry.text,
    })),
    createdAt: plainObject.createdAt.toISOString(),
    updatedAt: plainObject.updatedAt.toISOString(),
  };
}
