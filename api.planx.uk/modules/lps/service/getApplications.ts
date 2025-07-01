import { gql } from "graphql-request";
import type { LPSApplication } from "../types.js";
import { $api } from "../../../client/index.js";
import { subMinutes } from "date-fns";
import { ServerError } from "../../../errors/serverError.js";

const MAGIC_LINK_EXPIRY_MINUTES =
  process.env.NODE_ENV === "test"
    ? 0.05 // 3s expiry for tests
    : 10; // 10min on Pizza/Staging/Production

export const getExpiry = () =>
  subMinutes(new Date(), MAGIC_LINK_EXPIRY_MINUTES);

export interface RawApplication {
  id: string;
  updatedAt: string;
  submittedAt: string | null;
  service: {
    name: string;
    slug: string;
    team: {
      name: string;
      slug: string;
      domain: string | null;
    };
  };
}

interface ConsumeMagicLink {
  updateMagicLinks: {
    returning: {
      applications: RawApplication[];
    }[];
  };
}

const fetchApplicationsAndConsumeToken = async (
  email: string,
  token: string,
) => {
  try {
    const {
      updateMagicLinks: { returning },
    } = await $api.client.request<ConsumeMagicLink>(
      gql`
        mutation ConsumeMagicLinkToken(
          $email: String!
          $token: uuid!
          $expiry: timestamptz!
        ) {
          updateMagicLinks: update_lps_magic_links(
            where: {
              _and: {
                # Find matching token...
                email: { _eq: $email }
                token: { _eq: $token }
                operation: { _eq: "login" }
                # ...which is active and unexpired
                used_at: { _is_null: true }
                created_at: { _gte: $expiry }
              }
            }
            # Consume token
            _set: { used_at: "now()" }
          ) {
            returning {
              applications: lowcal_sessions {
                id
                updatedAt: updated_at
                submittedAt: submitted_at
                service: flow {
                  name
                  slug
                  team {
                    name
                    slug
                    domain
                  }
                }
              }
            }
          }
        }
      `,
      { token, email, expiry: getExpiry() },
    );

    if (!returning.length) return [];

    return returning[0].applications;
  } catch (error) {
    throw new ServerError({
      message: "GraphQL mutation ConsumeMagicLinkToken failed",
      status: 500,
      cause: error,
    });
  }
};

export const generateResumeLink = ({ service, id }: RawApplication) => {
  const {
    team: { slug: teamSlug, domain },
    slug: flowSlug,
  } = service;

  // Use custom domain if available or fall back to PlanX URL
  const serviceURL = domain
    ? `https://${domain}/${flowSlug}`
    : `${process.env.EDITOR_URL_EXT}/${teamSlug}/${flowSlug}/published`;

  return `${serviceURL}?sessionId=${id}`;
};

export const convertToLPSApplication = (
  raw: RawApplication,
): LPSApplication => ({
  id: raw.id,
  updatedAt: raw.updatedAt,
  submittedAt: raw.submittedAt,
  service: {
    name: raw.service.name,
    slug: raw.service.slug,
  },
  team: raw.service.team,
  url: generateResumeLink(raw),
});

export const getApplications = async (
  email: string,
  token: string,
): Promise<LPSApplication[]> => {
  const applications = await fetchApplicationsAndConsumeToken(email, token);
  const lpsApplications = applications.map(convertToLPSApplication);
  return lpsApplications;
};
