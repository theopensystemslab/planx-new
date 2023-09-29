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

  // TODO: Move to module
  // TODO: Get SessionByID, read passport, get exemption status
  // TODO: += exemption status to message
  try {
    // hook into the #planx-notifications channel
    const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);

    const data = req.body?.event?.data?.new;

    if (!isProduction) {
      return res.status(200).send({
        message: `Staging application submitted, skipping Slack notification`,
      });
    }

    let message = "";

    if (req.query.type === "bops-submission") {
      message = `:incoming_envelope: New BOPS submission *${data?.bops_id}* [${data?.destination_url}]`;
    }

    if (req.query.type === "uniform-submission") {
      message = `:incoming_envelope: New Uniform submission *${data?.submission_reference}* [${data?.response?.organisation}]`;
    }

    if (req.query.type === "email-submission") {
      message = `:incoming_envelope: New email submission "${data?.request?.personalisation?.serviceName}" *${data?.session_id}* [${data?.team_slug}]`;
    }

    await slack.send(message);
    return res.status(200).send({ message: "Posted to Slack", data: message });
  } catch (error) {
    return next({
      error,
      message: `Failed to send ${req.query.type} Slack notification. Error: ${error}`,
    });
  }
};

export { sendSlackNotification };
