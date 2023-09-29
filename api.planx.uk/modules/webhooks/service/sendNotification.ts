import SlackNotify from "slack-notify";
import {
  BOPSEventData,
  EmailEventData,
  EventData,
  EventType,
  UniformEventData,
} from "../types";

export const sendSlackNotification = async (
  data: EventData,
  type: EventType,
) => {
  // TODO: Get SessionByID, read passport, get exemption status
  // TODO: += exemption status to message

  // hook into the #planx-notifications channel
  const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);

  let message = "";

  if (type === "bops-submission") {
    const { bops_id, destination_url } = data as BOPSEventData;
    message = `:incoming_envelope: New BOPS submission *${bops_id}* [${destination_url}]`;
  } else if (type === "uniform-submission") {
    const { submission_reference, response } = data as UniformEventData;
    message = `:incoming_envelope: New Uniform submission *${submission_reference}* [${response.organisation}]`;
  } else if (type === "email-submission") {
    const { request, session_id, team_slug } = data as EmailEventData;
    message = `:incoming_envelope: New email submission "${request.personalisation.serviceName}" *${session_id}* [${team_slug}]`;
  }

  await slack.send(message);
  return message;
};
