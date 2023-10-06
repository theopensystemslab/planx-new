import { z } from "zod";
import { ValidatedRequestHandler } from "../../../../shared/middleware/validate";
import { ScheduledEventResponse } from "../../../../hasura/metadata";

export const createSessionEventSchema = z.object({
  body: z.object({
    createdAt: z.string().pipe(z.coerce.date()),
    payload: z.object({
      sessionId: z.string(),
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
