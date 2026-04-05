import mongoose, { Schema } from "mongoose";

const todoHistoryEntrySchema = new Schema(
  {
    time: { type: Date, required: true, default: Date.now },
    text: { type: String, required: true },
  },
  { _id: false },
);

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date, required: true },
    parentTaskId: {
      type: Schema.Types.ObjectId,
      ref: "Todo",
      default: null,
    },
    priority: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "urgent"],
    },
    history: { type: [todoHistoryEntrySchema], default: [] },
  },
  { timestamps: true, collection: "todos" },
);

export const TodoModel =
  mongoose.models.Todo ?? mongoose.model("Todo", todoSchema);
