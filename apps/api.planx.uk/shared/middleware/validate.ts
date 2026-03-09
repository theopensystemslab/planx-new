import type { Request, RequestHandler, Response, NextFunction } from "express";
import type { z } from "zod";

/**
 * Middleware to validate incoming requests to the API
 * Takes a ZodSchema and returns a validated, and typed, Request object
 */
export const validate =
  (
    schema:
      | z.AnyZodObject
      | z.ZodUnion<readonly [z.ZodTypeAny, ...z.ZodTypeAny[]]>
      | z.ZodType<any, z.ZodTypeDef, any>,
  ) =>
  async (
    req: Request<z.infer<typeof schema>>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const parsedReq = schema.parse({
        headers: req.headers,
        params: req.params,
        body: req.body,
        query: req.query,
      });

      // Assign parsed values to the response object
      // Required for schemas to transform or coerce raw requests
      res.locals.parsedReq = parsedReq;

      return next();
    } catch (error) {
      console.error(error);
      return res.status(400).json(error);
    }
  };

/**
 * Generic RequestHandler for use at the Controller level
 * @param TSchema Zod schema to define Request type and validation rules
 * @param TResponse Type to describe possible Response values
 * @param TLocals Optional type to describe Locals - values passed down the middleware chain
 */
export type ValidatedRequestHandler<
  TSchema extends z.ZodSchema,
  TResponse,
  TLocals extends Record<string, unknown> = Record<string, never>,
> = RequestHandler<
  Request["params"],
  TResponse,
  Request["body"],
  Request["query"],
  { parsedReq: z.infer<TSchema> } & TLocals
>;
