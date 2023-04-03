import { SiteAddress } from "@opensystemslab/planx-core/types/types";
import { format, addDays } from "date-fns";
import { gql, GraphQLClient } from "graphql-request";
import {
  publicGraphQLClient as publicClient,
  adminGraphQLClient as adminClient,
} from "../hasura";
import {
  EmailSubmissionNotifyConfig,
  LowCalSession,
  SaveAndReturnNotifyConfig,
  Team,
} from "../types";
import { notifyClient } from "./notify";

const DAYS_UNTIL_EXPIRY = 28;

/**
 * Triggered by applicants when saving or inviting to pay
 * Validated using email address & sessionId or paymentRequestId
 */
const publicEmailTemplates = {
  save: process.env.GOVUK_NOTIFY_SAVE_RETURN_EMAIL_TEMPLATE_ID,
  "invite-to-pay": process.env.GOV_UK_NOTIFY_PAYMENT_REQUEST_EMAIL_TEMPLATE_ID,
  "invite-to-pay-agent": process.env.GOV_UK_NOTIFY_PAYMENT_REQUEST_AGENT_EMAIL_TEMPLATE_ID,
};

/**
 * Triggered by applicants when resuming
 * Validated using email address & inbox (magic link)
 */
const hybridEmailTemplates = {
  resume: process.env.GOVUK_NOTIFY_RESUME_EMAIL_TEMPLATE_ID,
};

/**
 * Triggered by Hasura scheduled events
 * Validated with the useHasuraAuth() middleware
 */
const privateEmailTemplates = {
  reminder: process.env.GOVUK_NOTIFY_REMINDER_EMAIL_TEMPLATE_ID,
  expiry: process.env.GOVUK_NOTIFY_EXPIRY_EMAIL_TEMPLATE_ID,
  "payment-reminder": process.env.GOV_UK_PAYMENT_REMINDER_EMAIL_TEMPLATE_ID,
  "payment-reminder-agent": process.env.GOV_UK_PAYMENT_REMINDER_AGENT_EMAIL_TEMPLATE_ID,
  "payment-expiry": process.env.GOV_UK_PAYMENT_EXPIRY_EMAIL_TEMPLATE_ID,
  "payment-exipry-agent": process.env.GOV_UK_PAYMENT_EXPIRY_AGENT_EMAIL_TEMPLATE_ID,
  confirmation: process.env.GOVUK_NOTIFY_CONFIRMATION_EMAIL_TEMPLATE_ID,
  submit: process.env.GOVUK_NOTIFY_SUBMISSION_EMAIL_TEMPLATE_ID,
};

const emailTemplates = {
  ...publicEmailTemplates,
  ...hybridEmailTemplates,
  ...privateEmailTemplates,
};

export type Template = keyof typeof emailTemplates;

/**
 * Send email using the GovUK Notify client
 */
const sendEmail = async (
  template: Template,
  emailAddress: string,
  config: SaveAndReturnNotifyConfig | EmailSubmissionNotifyConfig
) => {
  const templateId = emailTemplates[template];
  if (!templateId) throw new Error("Template ID is required");

  try {
    await notifyClient.sendEmail(templateId, emailAddress, config);
    const returnValue: {
      message: string;
      expiryDate?: string;
    } = { message: "Success" };
    if (template === "expiry") softDeleteSession(config.personalisation.id!);
    if (template === "save")
      returnValue.expiryDate = config.personalisation.expiryDate;
    return returnValue;
  } catch (error: any) {
    const notifyError = JSON.stringify(error.response.data.errors[0]);
    throw Error(
      `Error: Failed to send email using Notify client. ${notifyError}`
    );
  }
};

/**
 * Converts a flow's slug to a pretty name
 * XXX: This relies on pretty names not having dashes in them, which may not always be true (e.g. Na h-Eileanan Siar, Stoke-on-Trent)
 */
const convertSlugToName = (slug: string): string =>
  slug[0].toUpperCase() + slug.substring(1).replaceAll("-", " ");

/**
 * Build the magic link which will be sent to users via email to continue their application
 */
const getResumeLink = (
  session: {
    id: string;
  },
  team: Team,
  flowSlug: string
) => {
  const serviceLink = getServiceLink(team, flowSlug);
  return `${serviceLink}?sessionId=${session.id}`;
};

/**
 * Construct a link to the service
 */
const getServiceLink = (team: Team, flowSlug: string): string => {
  // Link to custom domain
  if (team.domain) return `https://${team.domain}/${flowSlug}`;
  // Fallback to PlanX domain
  return `${process.env.EDITOR_URL_EXT}/${team.slug}/${flowSlug}/preview`;
};

/**
 * Return formatted expiry date, based on created_at timestamptz
 */
const calculateExpiryDate = (createdAt: string): string => {
  const expiryDate = addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY);
  const formattedExpiryDate = format(expiryDate, "dd MMMM yyyy");
  return formattedExpiryDate;
};

/**
 * Sends "Save", "Remind", "Expiry" and "Confirmation" emails to Save & Return users
 */
const sendSingleApplicationEmail = async (
  template: Template,
  email: string,
  sessionId: string
) => {
  try {
    const { flowSlug, team, session } = await validateSingleSessionRequest(
      email,
      sessionId,
      template
    );
    const config = {
      personalisation: getPersonalisation(session, flowSlug, team),
      reference: null,
      emailReplyToId: team.notifyPersonalisation.emailReplyToId,
    };
    const firstSave = !session.hasUserSaved;
    if (firstSave) await setupEmailEventTriggers(sessionId);
    return await sendEmail(template, email, config);
  } catch (error) {
    throw Error((error as Error).message);
  }
};

/**
 * Ensure that request for an email relating to a "single session" is valid
 * (e.g. Save, Expiry, Reminder)
 */
const validateSingleSessionRequest = async (
  email: string,
  sessionId: string,
  template: Template
) => {
  try {
    const query = gql`
      query ValidateSingleSessionRequest($sessionId: uuid!) {
        lowcal_sessions(where: { id: { _eq: $sessionId } }, limit: 1) {
          id
          data
          created_at
          has_user_saved
          flow {
            slug
            team {
              name
              slug
              notifyPersonalisation: notify_personalisation
              domain
            }
          }
        }
      }
    `;
    const client = getClientForTemplate(template);
    const headers = getSaveAndReturnPublicHeaders(sessionId, email);
    const {
      lowcal_sessions: [session],
    } = await client.request(query, { sessionId }, headers);

    if (!session) throw Error(`Unable to find session: ${sessionId}`);

    return {
      flowSlug: session.flow.slug,
      team: session.flow.team,
      session: await getSessionDetails(session),
    };
  } catch (error) {
    throw Error(`Unable to validate request. ${(error as Error).message}`);
  }
};

const getClientForTemplate = (template: Template): GraphQLClient =>
  template in privateEmailTemplates ? adminClient : publicClient;

interface SessionDetails {
  hasUserSaved: boolean;
  address: any;
  projectType: string;
  id: string;
  expiryDate: string;
}

/**
 * Parse session details into an object which will be read by email template
 */
const getSessionDetails = async (
  session: LowCalSession
): Promise<SessionDetails> => {
  const projectTypes = await getHumanReadableProjectType(session);
  const address: SiteAddress | undefined = session.data?.passport?.data?._address;
  const addressLine = address?.single_line_address || address?.title;

  return {
    address: addressLine || "Address not submitted",
    projectType: projectTypes || "Project type not submitted",
    id: session.id,
    expiryDate: calculateExpiryDate(session.created_at),
    hasUserSaved: session.has_user_saved,
  };
};

/**
 * Build a personalisation object which is read by email templates
 */
const getPersonalisation = (
  session: SessionDetails,
  flowSlug: string,
  team: Team
) => {
  return {
    resumeLink: getResumeLink(session, team, flowSlug),
    serviceLink: getServiceLink(team, flowSlug),
    serviceName: convertSlugToName(flowSlug),
    teamName: team.name,
    ...team.notifyPersonalisation,
    ...session,
  };
};

/**
 * Mark a lowcal_session record as deleted
 * Sessions older than 6 months cleaned up nightly by cron job sanitise_application_data on Hasura
 */
const softDeleteSession = async (sessionId: string) => {
  try {
    const mutation = gql`
      mutation SoftDeleteLowcalSession($sessionId: uuid!) {
        update_lowcal_sessions_by_pk(
          pk_columns: { id: $sessionId }
          _set: { deleted_at: "now()" }
        ) {
          id
        }
      }
    `;
    await adminClient.request(mutation, { sessionId });
  } catch (error) {
    throw new Error(`Error deleting session ${sessionId}`);
  }
};

/**
 * Mark a lowcal_session record as submitted
 * Sessions older than 6 months cleaned up nightly by cron job sanitise_application_data on Hasura
 */
const markSessionAsSubmitted = async (sessionId: string) => {
  try {
    const mutation = gql`
      mutation MarkSessionAsSubmitted($sessionId: uuid!) {
        update_lowcal_sessions_by_pk(
          pk_columns: { id: $sessionId }
          _set: { submitted_at: "now()" }
        ) {
          id
        }
      }
    `;
    await adminClient.request(mutation, { sessionId });
  } catch (error) {
    throw new Error(`Error marking session ${sessionId} as submitted`);
  }
};

/**
 * Get formatted list of the session's project types
 */
const getHumanReadableProjectType = async (
  session: LowCalSession
): Promise<string | void> => {
  const rawProjectType =
    session?.data?.passport?.data?.["proposal.projectType"];
  if (!rawProjectType) return;
  // Get human readable values from db
  const humanReadableList = await getReadableProjectTypeFromRaw(rawProjectType);
  // Join in readable format - en-US ensures we use Oxford commas
  const formatter = new Intl.ListFormat("en-US", { type: "conjunction" });
  const joinedList = formatter.format(humanReadableList);
  // Convert first character to uppercase
  const humanReadableString =
    joinedList.charAt(0).toUpperCase() + joinedList.slice(1);
  return humanReadableString;
};

/**
 * Query DB to get human readable project type values, based on passport variables
 */
const getReadableProjectTypeFromRaw = async (
  rawList: string[]
): Promise<string[]> => {
  const query = gql`
    query GetHumanReadableProjectType($rawList: [String!]) {
      project_types(where: { value: { _in: $rawList } }) {
        description
      }
    }
  `;
  const { project_types } = await publicClient.request(query, { rawList });
  const list = project_types.map(
    (result: { description: string }) => result.description
  );
  return list;
};

/**
 * Scope Save & Return requests for Public role
 * SessionId and Email is required to access a lowcal_sessions record
 */
const getSaveAndReturnPublicHeaders = (sessionId: string, email: string) => ({
  "x-hasura-lowcal-session-id": sessionId,
  "x-hasura-lowcal-email": email.toLowerCase(),
});

/**
 * Helper method to preserve session data order during reconciliation
 * XXX: This function is also maintained at editor.planx.uk/src/lib/lowcalStorage.ts
 */
const stringifyWithRootKeysSortedAlphabetically = (ob = {}) =>
  JSON.stringify(
    Object.keys(ob)
      .sort()
      .reduce(
        (acc, curr) => ({
          ...acc,
          [curr]: ob[curr as keyof typeof ob],
        }),
        {}
      )
  );

// Update lowcal_sessions.has_user_saved column to kick-off the setup_lowcal_expiry_events &
// setup_lowcal_reminder_events event triggers in Hasura
// Should only run once on initial save of a session
const setupEmailEventTriggers = async (sessionId: string) => {
  try {
    const mutation = gql`
      mutation SetupEmailNotifications($sessionId: uuid!) {
        update_lowcal_sessions_by_pk(
          pk_columns: { id: $sessionId }
          _set: { has_user_saved: true }
        ) {
          id
          has_user_saved
        }
      }
    `;
    const {
      update_lowcal_sessions_by_pk: { has_user_saved: hasUserSaved },
    } = await adminClient.request(mutation, { sessionId });
    return hasUserSaved;
  } catch (error) {
    throw new Error(
      `Error setting up email notifications for session ${sessionId}`
    );
  }
};

export {
  getSaveAndReturnPublicHeaders,
  sendEmail,
  convertSlugToName,
  getResumeLink,
  sendSingleApplicationEmail,
  markSessionAsSubmitted,
  DAYS_UNTIL_EXPIRY,
  calculateExpiryDate,
  getHumanReadableProjectType,
  stringifyWithRootKeysSortedAlphabetically,
};
