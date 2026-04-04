import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { HttpError } from "../errors/httpError.js";

function httpStatusFromError(error: unknown): number {
  if (error instanceof HttpError) return error.statusCode;
  if (error instanceof mongoose.Error.ValidationError) return 400;
  if (error instanceof mongoose.Error.CastError) return 400;
  if (error instanceof mongoose.Error.DocumentNotFoundError) return 404;
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: number }).code === 11000
  ) {
    return 409;
  }
  return 500;
}

function clientMessageForError(error: unknown, statusCode: number): string {
  if (statusCode >= 500) return "Internal server error";
  if (error instanceof Error) return error.message;
  return "Request failed";
}

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error);
    return;
  }
  const statusCode = httpStatusFromError(error);
  if (statusCode >= 500) {
    console.error(error);
  }
  const message = clientMessageForError(error, statusCode);
  response.status(statusCode).json({
    error: {
      message,
    },
  });
};
