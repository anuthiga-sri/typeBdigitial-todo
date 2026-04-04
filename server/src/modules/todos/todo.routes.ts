import type { ApiSuccess, Todo } from "@typebdigital/shared";
import { Router } from "express";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { validateBody } from "../../common/middleware/validateBody.js";
import { createTodoPayloadSchema, type CreateTodoPayload } from "./todo.dto.js";
import { createTodo } from "./todo.service.js";

export const todoRouter = Router();

todoRouter.post(
  "/",
  validateBody(createTodoPayloadSchema),
  asyncHandler(async (request, response) => {
    const createdTodo = await createTodo(
      request.validatedBody as CreateTodoPayload,
    );
    const successBody: ApiSuccess<Todo> = { data: createdTodo };
    response.status(201).json(successBody);
  }),
);
