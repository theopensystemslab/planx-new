import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import { getServiceLink } from "../../saveAndReturn/service/utils.js";

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
 * Payments are only taken on published services (never /draft or /preview), so applicants
 * return to the published service (either plan.uk or custom subdomain)
 *
 * The client never supplies a URL, in order to prevent spoofing / phishing via the API
 */
export const buildReturnURL = (
  flow: NonNullable<ReturnURLContext["flow"]>,
  sessionId: string,
  email: string | null | undefined,
): string => {
  const url = new URL(getServiceLink(flow.team, flow.slug));

  if (email) {
    url.searchParams.set("sessionId", sessionId);
    url.searchParams.set("email", email);
  }

  return url.toString();
};
