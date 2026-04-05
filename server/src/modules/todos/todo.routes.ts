import type { ApiSuccess, Todo } from "@typebdigital/shared";
import { Router } from "express";
import { asyncHandler } from "../../common/middleware/asyncHandler.js";
import { validateBody } from "../../common/middleware/validateBody.js";
import { validateParams } from "../../common/middleware/validateParams.js";
import { validateQuery } from "../../common/middleware/validateQuery.js";
import {
  createTodoPayloadSchema,
  listTodoQuerySchema,
  type CreateTodoPayload,
  type ListTodoQuery,
  type SetTodoCompletedPayload,
  type UpdateTodoPayload,
  todoIdParamsSchema,
  setTodoCompletedPayloadSchema,
  updateTodoPayloadSchema,
} from "./todo.dto.js";
import { createTodo } from "./services/createTodo.service.js";
import { deleteTodo } from "./services/deleteTodo.service.js";
import { getTodoById } from "./services/getTodoById.service.js";
import { listTodos } from "./services/listTodos.service.js";
import { setTodoCompleted } from "./services/updateTodoCompleteStatus.service.js";
import { updateTodo } from "./services/updateTodo.service.js";

export const todoRouter = Router();

todoRouter.get(
  "/",
  validateQuery(listTodoQuerySchema),
  asyncHandler(async (request, response) => {
    const query = request.validatedQuery as ListTodoQuery;
    const todos = await listTodos(query);
    const successBody: ApiSuccess<Todo[]> = { data: todos };
    response.json(successBody);
  }),
);

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

todoRouter.get(
  "/:id",
  validateParams(todoIdParamsSchema),
  asyncHandler(async (request, response) => {
    const { id } = request.validatedParams as { id: string };
    const todo = await getTodoById(id);
    const successBody: ApiSuccess<Todo> = { data: todo };
    response.json(successBody);
  }),
);

todoRouter.patch(
  "/:id/complete",
  validateParams(todoIdParamsSchema),
  validateBody(setTodoCompletedPayloadSchema),
  asyncHandler(async (request, response) => {
    const { id } = request.validatedParams as { id: string };
    const todo = await setTodoCompleted(
      id,
      request.validatedBody as SetTodoCompletedPayload,
    );
    const successBody: ApiSuccess<Todo> = { data: todo };
    response.json(successBody);
  }),
);

todoRouter.put(
  "/:id",
  validateParams(todoIdParamsSchema),
  validateBody(updateTodoPayloadSchema),
  asyncHandler(async (request, response) => {
    const { id } = request.validatedParams as { id: string };
    const todo = await updateTodo(id, request.validatedBody as UpdateTodoPayload);
    const successBody: ApiSuccess<Todo> = { data: todo };
    response.json(successBody);
  }),
);

todoRouter.delete(
  "/:id",
  validateParams(todoIdParamsSchema),
  asyncHandler(async (request, response) => {
    const { id } = request.validatedParams as { id: string };
    await deleteTodo(id);
    response.status(204).send();
  }),
);
