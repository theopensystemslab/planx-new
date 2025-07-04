import { Passport } from "@opensystemslab/planx-core";
import SlackNotify from "slack-notify";
import type {
  BOPSEventData,
  EmailEventData,
  EventData,
  EventType,
  S3EventData,
  UniformEventData,
} from "./types.js";
import { $api } from "../../../../client/index.js";

export const sendSlackNotification = async (
  data: EventData,
  type: EventType,
) => {
  const slack = SlackNotify(process.env.SLACK_WEBHOOK_URL!);
  let message = getMessageForEventType(data, type);

  const sessionId = getSessionIdFromEvent(data, type);
  const { disability, resubmission } =
    await getExemptionStatusesForSession(sessionId);
  if (disability) message += " [Exempt]";
  if (resubmission) message += " [Resubmission]";

  // Prefix message with a custom emoji if this submission fits November 2024 ODP Pilot testing criteria
  const pilotCouncils = [
    "barnet",
    "buckinghamshire",
    "camden",
    "gateshead",
    "lambeth",
    "medway",
    "south-gloucestershire",
    "southwark",
  ];
  // Message app types are a bit messy - Uniform won't have app type at all so we id by system because only accepts LDCs,
  //   BOPS will have internal ID with app type prefix, Email & S3 will have full PlanX service name
  const pilotServices = [
    "uniform",
    "happ",
    "hapr",
    "hret",
    "ldc",
    "minor",
    "major",
    "apply for planning permission",
    "apply for a lawful development certificate",
  ];

  let isPilotEvent = false;
  pilotCouncils.forEach((council) => {
    pilotServices.forEach((service) => {
      if (
        message?.toLowerCase()?.includes(council) &&
        message?.toLowerCase()?.includes(service)
      ) {
        isPilotEvent = true;
      }
    });
  });

  const baseMessage = ":incoming_envelope: " + message;
  message = isPilotEvent ? ":large_orange_square: " + baseMessage : baseMessage;

  await slack.send(message);
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
    const { session_id, team_slug, webhook_request } = data as S3EventData;
    return `New S3 + Power Automate submission "${webhook_request.data.service}" *${session_id}* [${team_slug}]`;
  }
};

const getSessionIdFromEvent = (data: EventData, type: EventType) =>
  ({
    "bops-submission": (data as BOPSEventData).session_id,
    "uniform-submission": (data as UniformEventData).payload?.sessionId,
    "email-submission": (data as EmailEventData).session_id,
    "s3-submission": (data as S3EventData).session_id,
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
