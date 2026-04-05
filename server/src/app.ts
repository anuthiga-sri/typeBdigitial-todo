import express from "express";
import { errorHandler } from "./common/middleware/errorHandler.js";
import { todoRouter } from "./modules/todos/todo.routes.js";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/todos", todoRouter);
  app.use(errorHandler);
  return app;
}
