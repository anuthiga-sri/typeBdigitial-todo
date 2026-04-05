import type { Todo } from "@typebdigital/shared";
import { Types } from "mongoose";
import { TodoModel } from "../todo.model.js";
import type { ListTodoQuery } from "../todo.dto.js";
import { serializeTodoPlain } from "../todo.serializer.js";

const PRIORITY_RANK: Record<string, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export async function listTodos(query: ListTodoQuery): Promise<Todo[]> {
  const mongoFilter: Record<string, unknown> = {};
  switch (query.filter) {
    case "active":
      mongoFilter.completed = false;
      break;
    case "completed":
      mongoFilter.completed = true;
      break;
    case "high":
      mongoFilter.priority = { $in: ["high", "urgent"] };
      break;
    case "overdue":
      mongoFilter.completed = false;
      mongoFilter.dueDate = { $lt: new Date() };
      break;
    default:
      break;
  }
  const rawList = await TodoModel.find(mongoFilter).lean().exec();
  const todos = rawList.map((doc) =>
    serializeTodoPlain({
      _id: doc._id as Types.ObjectId,
      title: doc.title,
      description: doc.description,
      completed: doc.completed,
      dueDate: doc.dueDate,
      parentTaskId: doc.parentTaskId as Types.ObjectId | null | undefined,
      priority: doc.priority,
      history: doc.history,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  );
  const sorted = [...todos].sort((left, right) => {
    if (query.sortBy === "dueDate") {
      const leftTime = new Date(left.dueDate).getTime();
      const rightTime = new Date(right.dueDate).getTime();
      return query.order === "asc"
        ? leftTime - rightTime
        : rightTime - leftTime;
    }
    const leftRank = PRIORITY_RANK[left.priority] ?? 99;
    const rightRank = PRIORITY_RANK[right.priority] ?? 99;
    return query.order === "asc"
      ? leftRank - rightRank
      : rightRank - leftRank;
  });
  return sorted;
}
