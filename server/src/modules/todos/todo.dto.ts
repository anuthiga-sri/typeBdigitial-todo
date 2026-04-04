import { z } from "zod";

const mongoObjectIdPattern = /^[a-fA-F0-9]{24}$/;

export const createTodoPayloadSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  completed: z.boolean().optional().default(false),
  dueDate: z.coerce.date(),
  parentTaskId: z
    .union([
      z.string().regex(mongoObjectIdPattern, "Invalid parent task id"),
      z.null(),
    ])
    .optional()
    .transform((rawParentId) =>
      rawParentId === null || rawParentId === undefined
        ? undefined
        : rawParentId,
    ),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

export type CreateTodoPayload = z.infer<typeof createTodoPayloadSchema>;
