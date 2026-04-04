import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export function validateBody<Schema extends z.ZodType>(schema: Schema) {
  return (request: Request, response: Response, next: NextFunction) => {
    const validationResult = schema.safeParse(request.body);
    if (!validationResult.success) {
      return response.status(400).json({
        error: {
          message: "Validation failed",
          details: validationResult.error.flatten(),
        },
      });
    }
    (request as Request & { validatedBody: z.infer<Schema> }).validatedBody =
      validationResult.data;
    next();
  };
}
