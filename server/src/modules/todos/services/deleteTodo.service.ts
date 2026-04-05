import { Types } from "mongoose";
import { HttpError } from "../../../common/errors/httpError.js";
import { TodoModel } from "../todo.model.js";

/** Deletes the todo and all subtasks. */
export async function deleteTodo(id: string): Promise<void> {
  const root = await TodoModel.findById(id).exec();
  if (!root) {
    throw new HttpError(404, "Todo not found");
  }
  const rootId = new Types.ObjectId(id);
  const idsToDelete: Types.ObjectId[] = [];
  const queue: Types.ObjectId[] = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    idsToDelete.push(current);
    const children = await TodoModel.find({ parentTaskId: current })
      .select("_id")
      .lean()
      .exec();
    for (const child of children) {
      queue.push(child._id as Types.ObjectId);
    }
  }
  await TodoModel.deleteMany({ _id: { $in: idsToDelete } });
}
