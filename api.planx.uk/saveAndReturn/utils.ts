import { SiteAddress } from "@opensystemslab/planx-core/types";
import { format, addDays } from "date-fns";
import { gql } from "graphql-request";
import { adminGraphQLClient as adminClient } from "../hasura";
import { LowCalSession, Team } from "../types";
import { Template, getClientForTemplate, sendEmail } from "../notify";
import { _admin as $admin } from "../client";

const DAYS_UNTIL_EXPIRY = 28;
const REMINDER_DAYS_FROM_EXPIRY = [7, 1];

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
export const getServiceLink = (team: Team, flowSlug: string): string => {
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
const sendSingleApplicationEmail = async ({
  template,
  email,
  sessionId,
  reminderDays,
}: {
  template: Template;
  email: string;
  sessionId: string;
  reminderDays?: number;
}) => {
  try {
    const { flowSlug, team, session } = await validateSingleSessionRequest(
      email,
      sessionId,
      template
    );
    const config = {
      personalisation: getPersonalisation(session, flowSlug, team, reminderDays),
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
  const passportProtectTypes =
    session.data.passport?.data?.["proposal.projectType"];
  const projectTypes =
    passportProtectTypes &&
    (await $admin.formatRawProjectTypes(passportProtectTypes));
  const address: SiteAddress | undefined =
    session.data?.passport?.data?._address;
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
  team: Team,
  reminderDays?: number,
) => {
  return {
    resumeLink: getResumeLink(session, team, flowSlug),
    serviceLink: getServiceLink(team, flowSlug),
    serviceName: convertSlugToName(flowSlug),
    teamName: team.name,
    sessionId: session.id,
    reminderDays: reminderDays === 1 ? `${reminderDays} day` : `${reminderDays} days`,
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
 * Scope Save & Return requests for Public role
 * SessionId and Email is required to access a lowcal_sessions record
 */
const getSaveAndReturnPublicHeaders = (sessionId: string, email: string) => ({
  "x-hasura-lowcal-session-id": sessionId,
  "x-hasura-lowcal-email": email.toLowerCase(),
});

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
  convertSlugToName,
  getResumeLink,
  sendSingleApplicationEmail,
  markSessionAsSubmitted,
  DAYS_UNTIL_EXPIRY,
  REMINDER_DAYS_FROM_EXPIRY,
  calculateExpiryDate,
  softDeleteSession,
};
