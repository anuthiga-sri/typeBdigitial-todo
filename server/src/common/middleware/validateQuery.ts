import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export function validateQuery<Schema extends z.ZodType>(schema: Schema) {
  return (request: Request, response: Response, next: NextFunction) => {
    const validationResult = schema.safeParse(request.query);
    if (!validationResult.success) {
      return response.status(400).json({
        error: {
          message: "Validation failed",
          details: validationResult.error.flatten(),
        },
      });
    }
    (request as Request & { validatedQuery: z.infer<Schema> }).validatedQuery =
      validationResult.data;
    next();
  };
}
