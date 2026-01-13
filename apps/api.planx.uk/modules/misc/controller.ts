import type { RequestHandler } from "express";
import { z } from "zod";
import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

export const healthCheck: RequestHandler = (_req, res) =>
  res.json({ hello: "world" });

export const downloadApplicationSchema = z.object({
  body: z.object({
    data: z.array(
      z.object({
        question: z.string(),
        responses: z.any(),
        metadata: z.any().optional(),
      }),
    ),
  }),
});

export type DownloadApplicationController = ValidatedRequestHandler<
  typeof downloadApplicationSchema,
  string | Record<"message", string>
>;
