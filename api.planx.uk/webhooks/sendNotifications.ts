import SlackNotify from "slack-notify";

import { Request, Response, NextFunction } from "express";

const sendSlackNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> => {
  const isProduction = process.env.APP_ENVIRONMENT === "production";
  const supportedTypes = [
    "bops-submission",
    "uniform-submission",
    "email-submission",
  ];
  if (
    !req.body?.event ||
    !req.query?.type ||
    !supportedTypes.includes(req.query.type as string)
  ) {
    return res.status(404).send({
      message: "Missing info required to send a Slack notification",
    });
  }

  try {
    // hook into the #planx-notifications channel
    const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);

    const data = req.body?.event?.data?.new;

    if (req.query.type === "bops-submission") {
      if (isProduction) {
        const bopsMessage = `:incoming_envelope: New BOPS submission *${data?.bops_id}* [${data?.destination_url}]`;
        await slack.send(bopsMessage);
        return res
          .status(200)
          .send({ message: "Posted to Slack", data: bopsMessage });
      }
      return res.status(200).send({
        message: `Staging application submitted, skipping Slack notification`,
      });
    }

    if (req.query.type === "uniform-submission") {
      if (isProduction) {
        const uniformMessage = `:incoming_envelope: New Uniform submission *${data?.submission_reference}* [${data?.response?.organisation}]`;
        await slack.send(uniformMessage);
        return res
          .status(200)
          .send({ message: "Posted to Slack", data: uniformMessage });
      }
      return res.status(200).send({
        message: `Staging application submitted, skipping Slack notification`,
      });
    }

    if (req.query.type === "email-submission") {
      if (isProduction) {
        const emailMessage = `:incoming_envelope: New email submission "${data?.request?.personalisation?.serviceName}" *${data?.session_id}* [${data?.team_slug}]`;
        await slack.send(emailMessage);
        return res
          .status(200)
          .send({ message: "Posted to Slack", data: emailMessage });
      }
      return res.status(200).send({
        message: `Staging application submitted, skipping Slack notification`,
      });
    }
  } catch (error) {
    return next({
      error,
      message: `Failed to send ${req.query.type} Slack notification. Error: ${error}`,
    });
  }
};

export { sendSlackNotification };
