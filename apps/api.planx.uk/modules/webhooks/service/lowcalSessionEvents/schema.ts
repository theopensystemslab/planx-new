import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type { ScheduledEventResponse } from "../../../../lib/hasura/metadata/index.js";

export const createSessionEventSchema = z.object({
  body: z.object({
    createdAt: z.string().pipe(z.coerce.date()),
    payload: z.object({
      sessionId: z.string(),
      email: z.string().email(),
    }),
  }),
});

export type CreateSessionEvent = z.infer<
  typeof createSessionEventSchema
>["body"];

export type CreateSessionEventController = ValidatedRequestHandler<
  typeof createSessionEventSchema,
  ScheduledEventResponse[]
>;
