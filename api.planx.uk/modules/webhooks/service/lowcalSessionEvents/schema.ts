import { z } from "zod";
import { ValidatedRequestHandler } from "../../../../shared/middleware/validate";
import { ScheduledEventResponse } from "../../../../lib/hasura/metadata";

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
