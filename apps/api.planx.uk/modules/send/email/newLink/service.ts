import { gql } from "graphql-request";
import { $api } from "../../../../client/index.js";
import { generateAccessToken } from "../service.js";
import {
  DEVOPS_EMAIL_REPLY_TO_ID,
  type TemplateRegistry,
} from "../../../../lib/notify/templates/index.js";
import { sendEmail } from "../../../../lib/notify/index.js";

export const createAccessToken = async (
  sessionId: string,
  submittedAt: string,
) => {
  try {
    const token = await generateAccessToken(
      sessionId,
      new Date(submittedAt).getUTCDate(),
    );

    return token;
  } catch (error) {
    // Catch errors and do not bubble-up - if this endpoint gets hit multiple times it should not re-send emails each time
    return undefined;
  }
};

export const getSession = async (sessionId: string) => {
  const { session } = await $api.client.request<{
    session: {
      submittedAt: string;
      flow: { id: string; name: string; team: { id: number } };
    } | null;
  }>(
    gql`
      query GetSessionSubmittedAt($id: uuid!) {
        session: lowcal_sessions_by_pk(id: $id) {
          id
          submittedAt: submitted_at
          flow {
            id
            name
            team {
              id
            }
          }
        }
      }
    `,
    { sessionId },
  );

  return session;
};

export const emailNewDownloadLink = async ({
  sessionId,
  submissionEmail,
  token,
  flowName,
}: {
  sessionId: string;
  submissionEmail: string;
  token: string;
  flowName: string;
}) => {
  const config: TemplateRegistry["new-download-link"]["config"] = {
    personalisation: {
      flowName,
      downloadLink: `${process.env.EDITOR_URL_EXT}/download-submission?token=${token}`,
      sessionId,
    },
    emailReplyToId: DEVOPS_EMAIL_REPLY_TO_ID,
  };

  await sendEmail("new-download-link", submissionEmail, config);
};
