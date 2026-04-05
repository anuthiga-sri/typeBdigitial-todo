import { z } from "zod";

const mongoObjectIdPattern = /^[a-fA-F0-9]{24}$/;
const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

const dueDateOnlySchema = z
  .string()
  .regex(dateOnlyPattern, "Due date must be YYYY-MM-DD")
  .transform((value) => new Date(`${value}T00:00:00.000Z`));

export const todoIdParamsSchema = z.object({
  id: z.string().regex(mongoObjectIdPattern, "Invalid todo id"),
});

export const listTodoQuerySchema = z.object({
  filter: z
    .enum(["all", "active", "completed", "high", "overdue"])
    .default("all"),
  sortBy: z.enum(["dueDate", "priority"]).default("dueDate"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export type ListTodoQuery = z.infer<typeof listTodoQuerySchema>;

export const createTodoPayloadSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional(),
  completed: z.boolean().optional().default(false),
  dueDate: dueDateOnlySchema,
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

export const setTodoCompletedPayloadSchema = z.object({
  completed: z.boolean(),
});

export type SetTodoCompletedPayload = z.infer<
  typeof setTodoCompletedPayloadSchema
>;

export const updateTodoPayloadSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    dueDate: dueDateOnlySchema.optional(),
    parentTaskId: z
      .union([
        z.string().regex(mongoObjectIdPattern),
        z.null(),
      ])
      .optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  })
  .strict()
  .refine((fields) => Object.keys(fields).length > 0, {
    message: "At least one field is required",
  });

export type UpdateTodoPayload = z.infer<typeof updateTodoPayloadSchema>;
