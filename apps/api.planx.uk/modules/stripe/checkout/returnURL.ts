import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { getServiceLink } from "../../saveAndReturn/service/utils.js";

/**
 * Which public route the applicant is paying from
 * The client picks one of these, and the API constructs the URL
 * The client never supplies a URL, in order to prevent spoofing / phishing via the API
 */
export const RETURN_TO = ["published", "preview", "draft"] as const;

export type ReturnTo = (typeof RETURN_TO)[number];

export interface ReturnURLContext {
  flow: {
    slug: string;
    team: { slug: string; domain: string | null };
  } | null;
  session: { flowId: string; email: string | null } | null;
}

export const getReturnURLContext = async (
  flowId: string,
  sessionId: string,
): Promise<ReturnURLContext> =>
  $api.client.request<ReturnURLContext>(
    gql`
      query GetCheckoutReturnURLContext($flowId: uuid!, $sessionId: uuid!) {
        flow: flows_by_pk(id: $flowId) {
          slug
          team {
            slug
            domain
          }
        }
        session: lowcal_sessions_by_pk(id: $sessionId) {
          flowId: flow_id
          email
        }
      }
    `,
    { flowId, sessionId },
  );

/**
 * Published services return to the team's custom domain where there is one
 *
 * /preview and /draft are only served on the PlanX domain
 */
export const getFlowURL = (
  returnTo: ReturnTo,
  flow: NonNullable<ReturnURLContext["flow"]>,
): string => {
  if (returnTo === "published") return getServiceLink(flow.team, flow.slug);

  return `${process.env.EDITOR_URL_EXT}/${flow.team.slug}/${flow.slug}/${returnTo}`;
};

export const buildReturnURL = (
  flowURL: string,
  sessionId: string,
  email: string | null | undefined,
): string => {
  const url = new URL(flowURL);

  if (email) {
    url.searchParams.set("sessionId", sessionId);
    url.searchParams.set("email", email);
  }

  return url.toString();
};
