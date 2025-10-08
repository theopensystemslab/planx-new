import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

interface DeleteSessionResponse {
  message: string;
}

export const deleteSessionSchema = z.object({
  body: z.object({
    payload: z.object({
      sessionId: z.string(),
    }),
  }),
});

export type DeleteSessionController = ValidatedRequestHandler<
  typeof deleteSessionSchema,
  DeleteSessionResponse
>;
