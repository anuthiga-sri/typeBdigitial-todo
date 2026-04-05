import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";

export function validateParams<Schema extends z.ZodType>(schema: Schema) {
  return (request: Request, response: Response, next: NextFunction) => {
    const validationResult = schema.safeParse(request.params);
    if (!validationResult.success) {
      return response.status(400).json({
        error: {
          message: "Validation failed",
          details: validationResult.error.flatten(),
        },
      });
    }
    (request as Request & { validatedParams: z.infer<Schema> }).validatedParams =
      validationResult.data;
    next();
  };
}
