import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type { CreateScheduledEventResponse } from "../../../../lib/hasura/metadata/types.js";

export const createSessionEmailEventSchema = z.object({
  body: z.object({
    createdAt: z.string().pipe(z.coerce.date()),
    payload: z.object({
      sessionId: z.string(),
      email: z.string().email(),
    }),
  }),
});

export type CreateSessionEmailEvent = z.infer<
  typeof createSessionEmailEventSchema
>["body"];

export type CreateSessionEmailEventController = ValidatedRequestHandler<
  typeof createSessionEmailEventSchema,
  CreateScheduledEventResponse[]
>;

export const createSessionDeleteEventSchema = z.object({
  body: z.object({
    operation: z.enum(["INSERT", "UPDATE"]),
    createdAt: z.string().pipe(z.coerce.date()).optional(),
    lockedAt: z.string().pipe(z.coerce.date()).optional(),
    payload: z.object({
      sessionId: z.string(),
    }),
  })
  .refine(
    data => data.createdAt || data.lockedAt,
    "Either createdAt or lockedAt must be provided"
  ),
});

export type CreateSessionDeleteEvent = z.infer<
  typeof createSessionDeleteEventSchema
>["body"];

export type CreateSessionDeleteEventController = ValidatedRequestHandler<
  typeof createSessionDeleteEventSchema,
  CreateScheduledEventResponse[]
>;
