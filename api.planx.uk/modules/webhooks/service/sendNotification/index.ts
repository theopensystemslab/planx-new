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
  let message = getMessageForEventType(data, type);
  let emoji = getEmojiForEventType(type, data);

  const sessionId = getSessionIdFromEvent(data, type);
  const { disability, resubmission } =
    await getExemptionStatusesForSession(sessionId);
  if (disability) message += " [Exempt]";
  if (resubmission) message += " [Resubmission]";

  await slack.send(emoji + " " + message);
  return message;
};

const getMessageForEventType = (data: EventData, type: EventType) => {
  if (type === "bops-submission") {
    const { bops_id, destination_url } = data as BOPSEventData;
    return `New BOPS submission *${bops_id}* [${destination_url}]`;
  }

  if (type === "uniform-submission") {
    const { submission_reference, response } = data as UniformEventData;
    return `New Uniform submission *${submission_reference}* [${response.organisation}]`;
  }

  if (type === "email-submission") {
    const { request, session_id, team_slug } = data as EmailEventData;
    return `New email submission "${request.personalisation.serviceName}" *${session_id}* [${team_slug}]`;
  }

  if (type === "s3-submission") {
    const { session_id, team_slug } = data as S3EventData;
    return `New S3 + Power Automate submission *${session_id}* [${team_slug}]`;
  }

  if (type === "flow-status") {
    const { id, status } = data as FlowStatusEventData;
    return `*${team_slug}/${flow_slug}* is now *${status}* (${id})`;
  }
};

const getEmojiForEventType = (type: EventType, data?: EventType) => {
  if (type.endsWith("-submission")) {
    return ":incoming_message:"
  }

  if (type === "flow-status") {
    const { id, status } = data as FlowStatusEventData;
    return status === "online" ? ":large_green_cirlce:" : ":no_entry:";
  }
}

const getSessionIdFromEvent = (data: EventData, type: EventType) =>
  ({
    "bops-submission": (data as BOPSEventData).session_id,
    "uniform-submission": (data as UniformEventData).payload?.sessionId,
    "email-submission": (data as EmailEventData).session_id,
    "s3-submission": (data as S3EventData).session_id,
    "flow-status": (data as FlowStatusEventData).id,
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
