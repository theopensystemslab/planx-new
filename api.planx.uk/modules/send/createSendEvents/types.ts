import { z } from "zod";
import type { CombinedResponse } from "../../../lib/hasura/metadata/index.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

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
    s3: eventSchema.optional(),
    idox: eventSchema.optional(),
  }),
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});

export type CreateSendEventsController = ValidatedRequestHandler<
  typeof combinedEventsPayloadSchema,
  CombinedResponse
>;
