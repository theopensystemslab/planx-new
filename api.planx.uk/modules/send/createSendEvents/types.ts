import { z } from "zod";
import { CombinedResponse } from "../../../lib/hasura/metadata";
import { ValidatedRequestHandler } from "../../../shared/middleware/validate";

const eventSchema = z.object({
  localAuthority: z.string(),
  body: z.object({
    sessionId: z.string().uuid(),
  }),
});

export const combinedEventsPayloadSchema = z.object({
  body: z.object({
    email: eventSchema.optional(),
    bops: eventSchema.optional(),
    uniform: eventSchema.optional(),
  }),
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});

export type CreateSendEventsController = ValidatedRequestHandler<
  typeof combinedEventsPayloadSchema,
  CombinedResponse
>;
