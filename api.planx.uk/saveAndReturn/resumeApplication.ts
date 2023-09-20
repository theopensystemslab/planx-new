import { NextFunction, Request, Response } from "express";
import { gql } from "graphql-request";
import { adminGraphQLClient as adminClient } from "../hasura";
import { LowCalSession, Team } from "../types";
import { convertSlugToName, getResumeLink, calculateExpiryDate } from "./utils";
import { sendEmail } from "../notify";
import type { SiteAddress } from "@opensystemslab/planx-core/types";
import { $public } from "../client";

/**
 * Send a "Resume" email to an applicant which list all open applications for a given council (team)
 */
const resumeApplication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { teamSlug, email } = req.body.payload;
    if (!teamSlug || !email)
      return next({
        status: 400,
        message: "Required value missing",
      });

    const { team, sessions } = await validateRequest(teamSlug, email);
    // Protect against phishing by returning a positive response even if no matching sessions found
    if (!sessions.length) return res.json({ message: "Success" });

    const config = {
      personalisation: await getPersonalisation(sessions, team),
      reference: null,
      emailReplyToId: team.notifyPersonalisation.emailReplyToId,
    };
    const response = await sendEmail("resume", email, config);
    return res.json(response);
  } catch (error) {
    return next({
      error,
      message: `Failed to send "Resume" email. ${(error as Error).message}`,
    });
  }
};

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
        lowcal_sessions(
          where: {
            email: { _eq: $email }
            deleted_at: { _is_null: true }
            submitted_at: { _is_null: true }
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
    const { lowcal_sessions, teams } = await adminClient.request(query, {
      teamSlug,
      email: email.toLowerCase(),
    });

    if (!teams?.length) throw Error;

    return {
      team: teams[0],
      sessions: lowcal_sessions,
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
    const service = convertSlugToName(session.flow.slug);
    const address: SiteAddress | undefined =
      session.data?.passport?.data?._address;
    const addressLine = address?.single_line_address || address?.title;
    const projectType = await $public.formatRawProjectTypes(
      session.data?.passport?.data?.["proposal.projectType"],
    );
    const resumeLink = getResumeLink(session, team, session.flow.slug);
    const expiryDate = calculateExpiryDate(session.created_at);

    return `Service: ${service}
      Address: ${addressLine || "Address not submitted"}
      Project type: ${projectType || "Project type not submitted"}
      Expiry Date: ${expiryDate}
      Link: ${resumeLink}`;
  };

  const content = await Promise.all(sessions.map(contentBuilder));
  return content.join("\n\n");
};

export { resumeApplication, buildContentFromSessions };
