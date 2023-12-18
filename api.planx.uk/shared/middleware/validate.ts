import { Request, RequestHandler, Response, NextFunction } from "express";
import { z } from "zod";

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
 * Accepts a ZodSchema representing the request and a Response type
 */
export type ValidatedRequestHandler<
  TSchema extends z.ZodSchema,
  TResponse,
> = RequestHandler<
  Request["params"],
  TResponse,
  Request["body"],
  Request["query"],
  { parsedReq: z.infer<TSchema> }
>;
