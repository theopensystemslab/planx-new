import { gql } from "graphql-request";
import type { LPSApplication } from "../types.js";
import { $api } from "../../../client/index.js";
import { subMinutes } from "date-fns";

const MAGIC_LINK_EXPIRY_MINUTES = 10 as const;

export const getExpiry = () =>
  subMinutes(new Date(), MAGIC_LINK_EXPIRY_MINUTES);

interface RawApplication {
  id: string;
  updatedAt: string;
  submittedAt: string;
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
  returning: {
    applications: RawApplication[];
  };
}

const fetchApplicationsAndConsumeToken = async (
  email: string,
  token: string,
) => {
  const {
    returning: { applications },
  } = await $api.client.request<ConsumeMagicLink>(
    gql`
      mutation ConsumeMagicLinkToken(
        $email: String!
        $token: uuid!
        $expiry: timestamptz!
      ) {
        update_lps_magic_links(
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
  return applications;
};

const generateResumeLink = ({ service, id }: RawApplication) => {
  const {
    team: { slug: teamSlug, domain },
    slug: flowSlug,
  } = service;

  // Use custom domain if available or fall back to PlanX URL
  const serviceURL = domain
    ? `https://${domain}/${flowSlug}`
    : `${process.env.EDITOR_URL_EXT}/${teamSlug}/${flowSlug}/published`;

  return `${serviceURL}/sessionId=${id}`;
};

const convertToLPSApplication = (raw: RawApplication): LPSApplication => ({
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
  if (!applications.length) return [];

  const lpsApplications = applications.map(convertToLPSApplication);
  return lpsApplications;
};
