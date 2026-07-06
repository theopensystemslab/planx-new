import type { SendArgs } from "slack-notify";
import SlackNotify from "slack-notify";

export const sendSlackMessage = (message: string | SendArgs) =>
  SlackNotify(process.env.SLACK_WEBHOOK_URL!).send(message);
