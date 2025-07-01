import { gql } from "graphql-request";
import { $api } from "../../../client/index.js";
import { sendEmail } from "../../../lib/notify/index.js";
import {
  DEVOPS_EMAIL_REPLY_TO_ID,
  type TemplateRegistry,
} from "../../../lib/notify/templates/index.js";
import { ServerError } from "../../../errors/serverError.js";

interface CreateMagicLink {
  magicLink: {
    token: string;
  };
}

const createMagicLinkToken = async (email: string): Promise<string> => {
  try {
    const {
      magicLink: { token },
    } = await $api.client.request<CreateMagicLink>(
      gql`
        mutation CreateLPSLoginToken($email: String!) {
          magicLink: insert_lps_magic_links_one(
            object: { email: $email, operation: "login" }
          ) {
            token
          }
        }
      `,
      { email },
    );

    return token;
  } catch (error) {
    throw new ServerError({
      message: "GraphQL query CreateLPSLoginToken failed",
      status: 500,
    });
  }
};

const generateMagicLink = async (email: string) => {
  const token = await createMagicLinkToken(email);
  const url = new URL("/applications", process.env.LPS_URL_EXT!);
  // TODO: Maybe base64 encode these as a single param?
  url.searchParams.append("token", token);
  url.searchParams.append("email", email);

  return url.toString();
};

const sendLoginEmail = async (email: string, magicLink: string) => {
  const config: TemplateRegistry["lps-login"]["config"] = {
    personalisation: { magicLink },
    // TODO: This should be a LPS specific email
    emailReplyToId: DEVOPS_EMAIL_REPLY_TO_ID,
  };

  await sendEmail("lps-login", email, config);
};

/**
 * Trigger an email containing a magic link
 * This will allow the user to access their applications via LPS
 */
export const login = async (email: string) => {
  const magicLink = await generateMagicLink(email);
  await sendLoginEmail(email, magicLink);
};
