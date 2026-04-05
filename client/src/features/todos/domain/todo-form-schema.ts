import { z } from "zod";

export const todoFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a due date"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  parentTaskId: z.string().optional(),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;
