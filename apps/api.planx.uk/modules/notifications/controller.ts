import { z } from "zod";

import { ServerError } from "../../errors/serverError.js";
import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";
import { resolveNotification } from "./service.js";

export const resolveNotificationEventSchema = z.object({
  body: z.object({
    payload: z.object({
      flowId: z.string(),
      type: z.string(), // one of `notification_type_enum.value`
    }),
  }),
});

export interface ResolveNotificationResponse {
  message: string;
  data: { id: number }[] | [];
}

export type ResolveNotificationController = ValidatedRequestHandler<
  typeof resolveNotificationEventSchema,
  ResolveNotificationResponse
>;

export const resolveNotificationController: ResolveNotificationController =
  async (_req, res, next) => {
    const { flowId, type } = res.locals.parsedReq.body.payload;

    try {
      const response = await resolveNotification(flowId, type);

      res.status(200).send({
        message: `Successfully resolved ${type} notification(s) for flow ID ${flowId}`,
        data: response,
      });
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to resolve ${type} notification for flow ID`,
          cause: error,
        }),
      );
    }
  };
