import { gql } from "graphql-request";
import { $api } from "../../../client/index.js";
import { ServerError } from "../../../errors/serverError.js";

interface CreateDownloadToken {
  download: {
    token: string;
  };
}

export const generateDownloadToken = async (
  email: string,
  sessionId: string,
) => {
  try {
    const {
      download: { token },
    } = await $api.client.request<CreateDownloadToken>(
      gql`
        mutation CreateLPSDownloadToken($email: String!, $sessionId: uuid!) {
          download: insert_lps_magic_links_one(
            object: {
              email: $email
              session_id: $sessionId
              operation: "download"
            }
          ) {
            token
          }
        }
      `,
      { email, sessionId },
    );

    return token;
  } catch (error) {
    throw new ServerError({
      message: "GraphQL query CreateLPSDownloadToken failed",
      status: 500,
    });
  }
};
