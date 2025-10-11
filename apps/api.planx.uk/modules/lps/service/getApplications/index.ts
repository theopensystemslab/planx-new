import type {
  DraftLPSApplication,
  Success,
  SubmittedLPSApplication,
  AwaitingPaymentLPSApplication,
} from "../../types/applications.js";
import { $api } from "../../../../client/index.js";
import { addDays, addMonths, subMinutes } from "date-fns";
import { ServerError } from "../../../../errors/serverError.js";
import { DAYS_UNTIL_EXPIRY } from "../../../saveAndReturn/service/utils.js";
import type {
  ConsumeMagicLink,
  Draft,
  Application,
  Submitted,
  AwaitingPayment,
} from "./types.js";
import { CONSUME_MAGIC_LINK_MUTATION } from "./mutation.js";
import { URLSearchParams } from "url";
import { RETENTION_PERIOD_MONTHS } from "../../../webhooks/service/sanitiseApplicationData/operations.js";

const MAGIC_LINK_EXPIRY_MINUTES =
  process.env.NODE_ENV === "test"
    ? 0.05 // 3s expiry for tests
    : 10; // 10min on Pizza/Staging/Production

export const getExpiry = () =>
  subMinutes(new Date(), MAGIC_LINK_EXPIRY_MINUTES);

const fetchApplicationsAndConsumeToken = async (
  email: string,
  token: string,
) => {
  try {
    const {
      updateMagicLinks: { returning },
    } = await $api.client.request<ConsumeMagicLink>(
      CONSUME_MAGIC_LINK_MUTATION,
      { token, email, expiry: getExpiry() },
    );

    if (!returning.length) return { applications: [] };

    return returning[0];
  } catch (error) {
    throw new ServerError({
      message: "GraphQL mutation ConsumeMagicLinkToken failed",
      status: 500,
      cause: error,
    });
  }
};

export const generateResumeLink = (
  { service, id }: Application,
  email: string,
) => {
  const {
    team: { slug: teamSlug, domain },
    slug: flowSlug,
  } = service;

  // Use custom domain if available or fall back to PlanX URL
  const serviceURL = domain
    ? `https://${domain}/${flowSlug}`
    : `${process.env.EDITOR_URL_EXT}/${teamSlug}/${flowSlug}/published`;

  const params = new URLSearchParams({ sessionId: id, email });
  return `${serviceURL}?${params.toString()}`;
};

const mapSharedFields = (raw: Application) => ({
  status: raw.status,
  id: raw.id,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
  service: {
    name: raw.service.name,
  },
  team: {
    name: raw.service.team.name,
    slug: raw.service.team.slug,
  },
  address: raw.addressLine || raw.addressTitle,
});

export const convertToDraftLPSApplication = (
  raw: Draft,
  email: string,
): DraftLPSApplication => ({
  ...mapSharedFields(raw),
  serviceUrl: generateResumeLink(raw, email),
  expiresAt: addDays(Date.parse(raw.createdAt), DAYS_UNTIL_EXPIRY).toString(),
});

export const convertToSubmittedLPSApplication = (
  raw: Submitted,
): SubmittedLPSApplication => ({
  ...mapSharedFields(raw),
  submittedAt: raw.submittedAt,
  // The expiry date of a submitted payment is the date which we'll sanitise the data. Beyond this, the application data cannot be retrieved.
  expiresAt: addMonths(
    Date.parse(raw.submittedAt),
    RETENTION_PERIOD_MONTHS,
  ).toString(),
});

export const convertToAwaitingPaymentLPSApplication = (
  raw: AwaitingPayment,
): AwaitingPaymentLPSApplication => ({
  ...mapSharedFields(raw),
  paymentUrl: "TODO",
  // The expiry date of a session awaiting payment is derived from the creation of the associated payment request
  expiresAt: addDays(
    Date.parse(raw.paymentRequest[0].createdAt),
    DAYS_UNTIL_EXPIRY,
  ).toString(),
});

export const getApplications = async (
  email: string,
  token: string,
): Promise<Success> => {
  const { applications } = await fetchApplicationsAndConsumeToken(email, token);

  const formattedApplications = applications.map((application) => {
    switch (application.status) {
      case "draft":
        return convertToDraftLPSApplication(application, email);
      case "awaitingPayment":
        return convertToAwaitingPaymentLPSApplication(application);
      case "submitted":
        return convertToSubmittedLPSApplication(application);
    }
  });

  return formattedApplications;
};
