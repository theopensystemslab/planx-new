import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

/**
 * Generic payload allowing Hasura events to post Slack messages to a channel
 */
export const sendSlackMessageSchema = z.object({
  body: z.object({
    channel: z.string(),
    message: z.string(),
    username: z.string().optional(),
  }),
});

interface SendSlackMessageResponse {
  message: string;
}

export type SendSlackMessageController = ValidatedRequestHandler<
  typeof sendSlackMessageSchema,
  SendSlackMessageResponse
>;
