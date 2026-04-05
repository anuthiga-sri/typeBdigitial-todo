import type { NextFunction, Request, RequestHandler, Response } from "express";

export function asyncHandler(
  routeHandler: (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => Promise<void>,
): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(routeHandler(request, response, next)).catch(next);
  };
}
