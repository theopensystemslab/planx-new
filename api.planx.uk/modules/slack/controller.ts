import SlackNotify from "slack-notify";
import { z } from "zod";
import { ServerError } from "../../errors/index.js";
import { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

interface SendSlackNotificationResponse {
  message: string;
}

export const slackNotificationSchema = z.object({
  body: z.object({
    message: z.string(),
  }),
});

export type SendSlackNotificationController = ValidatedRequestHandler<
  typeof slackNotificationSchema,
  SendSlackNotificationResponse
>;

export const sendSlackNotificationController: SendSlackNotificationController =
  async (_req, res, next) => {
    const { message } = res.locals.parsedReq.body;

    const isProduction = process.env.APP_ENVIRONMENT === "production";
    if (!isProduction) {
      return res.status(200).send({
        message: `Staging environment, skipping Slack notification. Message "${message}"`,
      });
    }

    try {
      const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
      await slack.send(message);

      return res.status(200).send({
        message: `Sent Slack notification. Message "${message}"`,
      });
    } catch (error) {
      return next(
        new ServerError({
          message: `Failed to send Slack notification. Error ${error}`,
        }),
      );
    }
  };
