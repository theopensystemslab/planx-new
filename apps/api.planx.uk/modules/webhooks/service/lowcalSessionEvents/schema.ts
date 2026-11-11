import { z } from "zod";

import type { CreateScheduledEventResponse } from "../../../../lib/hasura/metadata/types.js";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

export const createSessionEmailEventSchema = z.object({
  body: z.object({
    createdAt: z.string().pipe(z.coerce.date()),
    payload: z.object({
      sessionId: z.uuid(),
      email: z.email(),
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
  body: z
    .object({
      operation: z.enum(["INSERT", "UPDATE"]),
      createdAt: z.string().pipe(z.coerce.date()).optional(),
      /** Null when the session has been unlocked (e.g. a delayed payment failed) */
      lockedAt: z.string().pipe(z.coerce.date()).nullish(),
      /** When the applicant first started a delayed payment (e.g. Bacs) - the window to pay runs from here */
      delayedPaymentStartedAt: z.string().pipe(z.coerce.date()).nullish(),
      payload: z.object({
        sessionId: z.uuid(),
      }),
    })
    .refine(
      (data) => data.createdAt || data.operation === "UPDATE",
      "createdAt must be provided for an INSERT",
    ),
});

export type CreateSessionDeleteEvent = z.infer<
  typeof createSessionDeleteEventSchema
>["body"];

export type CreateSessionDeleteEventController = ValidatedRequestHandler<
  typeof createSessionDeleteEventSchema,
  CreateScheduledEventResponse[]
>;
