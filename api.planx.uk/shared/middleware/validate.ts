import { Request, RequestHandler, Response, NextFunction } from "express";
import { AnyZodObject, ZodSchema, ZodTypeAny, ZodUnion, z } from "zod";

/**
 * Middleware to validate incoming requests to the API
 * Takes a ZodSchema and returns a validated, and typed, Request object
 */
export const validate =
  (schema: AnyZodObject | ZodUnion<readonly [ZodTypeAny, ...ZodTypeAny[]]>) =>
  async (
    req: Request<z.infer<typeof schema>>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const parsedReq = schema.parse({
        params: req.params,
        body: req.body,
        query: req.query,
      });

      // Assign parsed values to the request object
      // Required for schemas to transform or coerce raw requests
      req.params = parsedReq.params;
      req.body = parsedReq.body;
      req.query = parsedReq.query;

      return next();
    } catch (error) {
      console.error(error);
      return res.status(400).json(error);
    }
  };

/**
 * Generic RequestHandler for use at the Controller level
 * Accepts a ZodSchema representing the request and a Response type
 */
export type ValidatedRequestHandler<
  TSchema extends ZodSchema,
  TResponse,
> = RequestHandler<
  z.infer<TSchema>["params"],
  TResponse,
  z.infer<TSchema>["body"],
  z.infer<TSchema>["query"]
>;
