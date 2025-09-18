import { gql } from "graphql-request";
import { $admin } from "../../../client/index.js";
import { ServerError } from "../../../errors/serverError.js";
import type { DownloadHTML } from "../types/downloadHTML.js";
import { getExpiry } from "../service/generateHTML.js";

export const validateDownloadToken: DownloadHTML = async (_req, res, next) => {
  const { sessionId } = res.locals.parsedReq.body;
  const { authorization: token } = res.locals.parsedReq.headers;

  console.log({ sessionId, token });

  try {
    const { isValid, isExpired, isConsumed } = await getDownloadTokenStatus(
      token,
      sessionId,
    );

    if (!isValid) {
      return res.status(404).json({
        error: "DOWNLOAD_TOKEN_INVALID",
        message: "Download token not found or invalid",
      });
    }

    if (isConsumed) {
      return res.status(410).json({
        error: "DOWNLOAD_TOKEN_CONSUMED",
        message: "This download token has already been used",
      });
    }

    if (isExpired) {
      return res.status(410).json({
        error: "DOWNLOAD_TOKEN_EXPIRED",
        message: "This download token has expired",
      });
    }

    return next();
  } catch (error) {
    return next(
      new ServerError({
        status: error instanceof ServerError ? error.status : undefined,
        message: `Failed to validate download token. ${
          (error as Error).message
        }`,
      }),
    );
  }
};

interface GetDownloadTokenStatusQuery {
  downloadToken: [
    {
      usedAt: string | null;
      createdAt: string;
    },
  ];
}

const getDownloadTokenStatus = async (userToken: string, sessionId: string) => {
  const CHECK_DOWNLOAD_TOKEN_QUERY = gql`
    query GetDownloadTokenStatus($userToken: uuid!, $sessionId: uuid!) {
      downloadToken: lps_magic_links(
        where: { session_id: { _eq: $sessionId }, token: { _eq: $userToken } }
      ) {
        usedAt: used_at
        createdAt: created_at
      }
    }
  `;

  const {
    downloadToken: [token],
  } = await $admin.client.request<GetDownloadTokenStatusQuery>(
    CHECK_DOWNLOAD_TOKEN_QUERY,
    {
      userToken,
      sessionId,
    },
  );

  if (!token) return { isValid: false };

  const isExpired = new Date(token.createdAt) < getExpiry();
  const isConsumed = Boolean(token.usedAt);

  return { isValid: true, isExpired, isConsumed };
};
