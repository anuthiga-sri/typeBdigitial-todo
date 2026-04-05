import type { Todo } from "@typebdigital/shared";
import type { HydratedDocument } from "mongoose";
import type { Types } from "mongoose";

type TodoMongoPlain = {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  completed: boolean;
  dueDate: Date;
  parentTaskId: Types.ObjectId | null | undefined;
  priority: string;
  history: { time: Date; text: string }[];
  createdAt: Date;
  updatedAt: Date;
};

function mapPlainToTodo(plain: TodoMongoPlain): Todo {
  return {
    _id: plain._id.toString(),
    title: plain.title,
    description: plain.description,
    completed: plain.completed,
    dueDate: plain.dueDate.toISOString(),
    parentTaskId: plain.parentTaskId ? plain.parentTaskId.toString() : null,
    priority: plain.priority as Todo["priority"],
    history: (plain.history ?? []).map((historyEntry) => ({
      time: historyEntry.time.toISOString(),
      text: historyEntry.text,
    })),
    createdAt: plain.createdAt.toISOString(),
    updatedAt: plain.updatedAt.toISOString(),
  };
}

/** Serialize a MongoDB document to a `Todo` object. */
export function serializeTodoDocument(
  mongoDocument: HydratedDocument<TodoMongoPlain>,
): Todo {
  return mapPlainToTodo(mongoDocument.toObject());
}

/** Serialize a plain object to a `Todo` object. */
export function serializeTodoPlain(plain: TodoMongoPlain): Todo {
  return mapPlainToTodo(plain);
}
