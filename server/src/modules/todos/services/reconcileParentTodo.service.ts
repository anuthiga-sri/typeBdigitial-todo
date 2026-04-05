import { Types } from "mongoose";
import { TodoModel } from "../todo.model.js";

export async function reconcileParentCompletion(parentId: string): Promise<void> {
  const children = await TodoModel.find({
    parentTaskId: new Types.ObjectId(parentId),
  }).exec();
  if (children.length === 0) return;
  const allDone = children.every((child) => child.completed);
  const parent = await TodoModel.findById(parentId).exec();
  if (!parent) return;
  if (parent.completed !== allDone) {
    parent.completed = allDone;
    if (allDone) {
      parent.history.push({ text: "Subtasks completed" });
    }
    await parent.save();
  }
}
