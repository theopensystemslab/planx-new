import { z } from "zod";
import type { CombinedResponse } from "../../../lib/hasura/metadata/index.js";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";
import {
  SEND_INTEGRATIONS,
  type SendIntegration,
} from "@opensystemslab/planx-core/types";

const eventSchema = z.object({
  localAuthority: z.string(),
  body: z.object({
    sessionId: z.string().uuid(),
  }),
});

/** Iterate over all possible SendIntegrations to generate the body for this endpoint */
const bodySchema = z.object(
  SEND_INTEGRATIONS.reduce(
    (acc, integration) => {
      acc[integration] = eventSchema.optional();
      return acc;
    },
    {} as Record<SendIntegration, z.ZodOptional<typeof eventSchema>>,
  ),
);

export const combinedEventsPayloadSchema = z.object({
  body: bodySchema,
  params: z.object({
    sessionId: z.string().uuid(),
  }),
});

export type CreateSendEventsController = ValidatedRequestHandler<
  typeof combinedEventsPayloadSchema,
  CombinedResponse
>;
