import SlackNotify from "slack-notify";
import { Request, Response, NextFunction } from "express";

const sendSlackNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const supportedTypes = ["bops-submission", "uniform-submission"];
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
      const isBOPSStaging = data?.destination_url?.includes("staging");
      if (isBOPSStaging) {
        return res.status(200).send({
          message: `Staging application submitted, skipping Slack notification`,
        });
      }

      const bopsMessage = `:incoming_envelope: New BOPS submission *${data?.bops_id}* [${data?.destination_url}]`;
      await slack.send(bopsMessage);
      return res
        .status(200)
        .send({ message: "Posted to Slack", data: bopsMessage });
    }

    if (req.query.type === "uniform-submission") {
      const isUniformStaging =
        data?.response?.["_links"]?.self?.href?.includes("staging");
      if (isUniformStaging) {
        return res.status(200).send({
          message: `Staging application submitted, skipping Slack notification`,
        });
      }

      const uniformMessage = `:incoming_envelope: New Uniform submission *${data?.submission_reference}* [${data?.response?.organisation}]`;
      await slack.send(uniformMessage);
      return res
        .status(200)
        .send({ message: "Posted to Slack", data: uniformMessage });
    }
  } catch (error) {
    return next({
      error,
      message: `Failed to send ${req.query.type} Slack notification. Error: ${error}`,
    });
  }
};

export { sendSlackNotification };
