import { gql } from "graphql-request";
import type { Applications } from "../types.js";
import { $admin } from "../../../client/index.js";
import { getExpiry } from "../service/getApplications.js";
import { ServerError } from "../../../errors/serverError.js";

export const validateMagicLinkStatus: Applications = async (
  _req,
  res,
  next,
) => {
  const { token } = res.locals.parsedReq.body;

  try {
    const { isValid, isExpired, isConsumed } = await getLinkStatus(token);

    if (!isValid) {
      return res.status(404).json({
        error: "LINK_INVALID",
        message: "Magic link not found or invalid",
      });
    }

    if (isConsumed) {
      return res.status(410).json({
        error: "LINK_CONSUMED",
        message: "This magic link has already been used",
      });
    }

    if (isExpired) {
      return res.status(410).json({
        error: "LINK_EXPIRED",
        message: "This magic link has expired",
      });
    }

    return next();
  } catch (error) {
    return next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to validate LPS magic link. ${
          (error as Error).message
        }`,
      }),
    );
  }
};

interface GetMagicLinkStatusQuery {
  magicLink: {
    usedAt: string | null;
    createdAt: string;
  } | null;
}

const getLinkStatus = async (token: string) => {
  const CHECK_LINK_QUERY = gql`
    query GetMagicLinkStatus($token: uuid!) {
      magicLink: lps_magic_links_by_pk(token: $token) {
        usedAt: used_at
        createdAt: created_at
      }
    }
  `;

  const { magicLink } = await $admin.client.request<GetMagicLinkStatusQuery>(
    CHECK_LINK_QUERY,
    { token },
  );

  if (!magicLink) return { isValid: false };

  const isExpired = new Date(magicLink.createdAt) < getExpiry();
  const isConsumed = Boolean(magicLink.usedAt);

  return { isValid: true, isExpired, isConsumed };
};
