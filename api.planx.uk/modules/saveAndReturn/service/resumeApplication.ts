import type { SiteAddress } from "@opensystemslab/planx-core/types";
import { differenceInDays } from "date-fns";
import { gql } from "graphql-request";
import { $api, $public } from "../../../client";
import { sendEmail } from "../../../lib/notify";
import { LowCalSession, Team } from "../../../types";
import { DAYS_UNTIL_EXPIRY, calculateExpiryDate, getResumeLink } from "./utils";

/**
 * Send a "Resume" email to an applicant which list all open applications for a given council (team)
 */
const resumeApplication = async (teamSlug: string, email: string) => {
  const { team, sessions } = await validateRequest(teamSlug, email);
  // Protect against phishing by returning a positive response even if no matching sessions found
  if (!sessions.length) return { message: "Success" };

  const config = {
    personalisation: await getPersonalisation(sessions, team),
    reference: null,
    emailReplyToId: team.notifyPersonalisation.emailReplyToId,
  };
  const response = await sendEmail("resume", email, config);
  return response;
};

interface ValidateRequest {
  teams: Team[];
  lowcalSessions: LowCalSession[] | null;
}

/**
 * Validate that there are sessions matching the request
 * XXX: Admin role is required here as we are relying on the combination of email
 * address + inbox access to "secure" these requests
 */
const validateRequest = async (
  teamSlug: string,
  email: string,
): Promise<{
  team: Team;
  sessions: LowCalSession[];
}> => {
  try {
    const query = gql`
      query ValidateRequest($email: String, $teamSlug: String) {
        lowcalSessions: lowcal_sessions(
          where: {
            email: { _eq: $email }
            deleted_at: { _is_null: true }
            locked_at: { _is_null: true }
            submitted_at: { _is_null: true }
            sanitised_at: { _is_null: true }
            flow: { team: { slug: { _eq: $teamSlug } } }
          }
          order_by: { flow: { slug: asc }, created_at: asc }
        ) {
          id
          created_at
          data
          flow {
            slug
          }
        }
        teams(where: { slug: { _eq: $teamSlug } }) {
          slug
          name
          notifyPersonalisation: notify_personalisation
          domain
        }
      }
    `;
    const { lowcalSessions, teams } =
      await $api.client.request<ValidateRequest>(query, {
        teamSlug,
        email: email.toLowerCase(),
      });

    if (!teams?.length) throw Error;

    return {
      team: teams[0],
      sessions: lowcalSessions || [],
    };
  } catch (error) {
    throw Error("Unable to validate request");
  }
};

/**
 * Construct personalisation object required for the "Resume" Notify template
 */
const getPersonalisation = async (sessions: LowCalSession[], team: Team) => {
  return {
    teamName: team.name,
    content: await buildContentFromSessions(sessions, team),
    ...team.notifyPersonalisation,
  };
};

/**
 * Build the main content of the "Resume" email
 * A formatted list of all open applications, including magic link to resume
 */
const buildContentFromSessions = async (
  sessions: LowCalSession[],
  team: Team,
): Promise<string> => {
  const contentBuilder = async (session: LowCalSession) => {
    const address: SiteAddress | undefined =
      session.data?.passport?.data?._address;
    const addressLine = address?.single_line_address || address?.title;
    const projectType = await $public.formatRawProjectTypes(
      session.data?.passport?.data?.["proposal.projectType"],
    );
    const resumeLink = getResumeLink(session, team, session.flow.slug);
    const expiryDate = calculateExpiryDate(session.created_at);

    // Filter out any sessions that are expired (safety net for failed sanitation)
    const today = new Date();
    const sessionAge = differenceInDays(today, new Date(session.created_at));

    if (sessionAge < DAYS_UNTIL_EXPIRY)
      return `Service: ${session.flow.name}
      Address: ${addressLine || "Address not submitted"}
      Project type: ${projectType || "Project type not submitted"}
      Expiry Date: ${expiryDate}
      Link: ${resumeLink}`;
  };

  const content = await Promise.all(sessions.map(contentBuilder));
  return content.filter(Boolean).join("\n\n");
};

export { buildContentFromSessions, resumeApplication };
