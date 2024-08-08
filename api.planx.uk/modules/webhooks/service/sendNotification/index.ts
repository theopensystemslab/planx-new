import { Passport } from "@opensystemslab/planx-core";
import SlackNotify from "slack-notify";
import {
  BOPSEventData,
  EmailEventData,
  EventData,
  EventType,
  FlowStatusEventData,
  S3EventData,
  UniformEventData,
} from "./types";
import { $api } from "../../../../client";

export const sendSlackNotification = async (
  data: EventData,
  type: EventType,
) => {
  const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
  const message = await getMessageForEventType(data, type);

  await slack.send(message);
  return message;
};

const getMessageForEventType = async (data: EventData, type: EventType) => {
  let message = "";
  if (type.endsWith("-submission")) {
    const emoji = ":incoming_message:";
    if (type === "bops-submission") {
      const { bops_id, destination_url } = data as BOPSEventData;
      message = `${emoji} New BOPS submission *${bops_id}* [${destination_url}]`;
    }

    if (type === "uniform-submission") {
      const { submission_reference, response } = data as UniformEventData;
      message = `${emoji} New Uniform submission *${submission_reference}* [${response.organisation}]`;
    }

    if (type === "email-submission") {
      const { request, session_id, team_slug } = data as EmailEventData;
      message = `${emoji} New email submission "${request.personalisation.serviceName}" *${session_id}* [${team_slug}]`;
    }

    if (type === "s3-submission") {
      const { session_id, team_slug } = data as S3EventData;
      message = `${emoji} New S3 + Power Automate submission *${session_id}* [${team_slug}]`;
    }

    const sessionId = getSessionIdFromEvent(data, type);
    if (sessionId) {
      const { disability, resubmission } =
        await getExemptionStatusesForSession(sessionId);
      if (disability) message += " [Exempt]";
      if (resubmission) message += " [Resubmission]";
    }
  }

  if (type === "flow-status") {
    const { id: flowId, status } = data as FlowStatusEventData;
    // todo fetch extra data based on flowId
    const emoji = status === "online" ? ":large_green_circle:" : ":no_entry:";
    message = `${emoji} Flow is now *${status}* (${flowId})`;
  }

  return message;
};

const getSessionIdFromEvent = (data: EventData, type: EventType) =>
  ({
    "bops-submission": (data as BOPSEventData).session_id,
    "uniform-submission": (data as UniformEventData).payload?.sessionId,
    "email-submission": (data as EmailEventData).session_id,
    "s3-submission": (data as S3EventData).session_id,
    "flow-status": undefined,
  })[type];

const getExemptionStatusesForSession = async (sessionId: string) => {
  const session = await $api.session.find(sessionId);
  if (!session) throw Error(`Unable to find session with ID ${sessionId}`);

  const passport = new Passport(session.data.passport);
  const disability = passport.boolean(["application.fee.exemption.disability"]);
  const resubmission = passport.boolean([
    "application.fee.exemption.resubmission",
  ]);

  return { disability, resubmission };
};
