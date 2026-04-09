import { ServerError } from "../../../../errors/serverError.js";
import { getSubmissionEmail } from "../service.js";
import {
  createAccessToken,
  getSession,
  emailNewDownloadLink,
} from "./service.js";
import type { Controller } from "./types.js";

export const sendNewDownloadLink: Controller = async (req, res, next) => {
  const { sessionId, localAuthority } = res.locals.parsedReq.body;

  try {
    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: "SESSION_NOT_FOUND" });

    const token = await createAccessToken(sessionId, session.submittedAt);
    if (!token) return res.status(409).json({ error: "LINK_ALREADY_EMAILED" });

    const submissionEmailAddress = await getSubmissionEmail(
      session.flow.team.id,
      session.flow.id,
    );
    if (!submissionEmailAddress)
      return res.status(400).json({ error: "EMAIL_NOT_CONFIGURED" });

    await emailNewDownloadLink({
      submissionEmailAddress,
      sessionId,
      token,
      serviceName: session.flow.name,
    });

    return res.status(200).json({ message: "An email sent to your inbox" });
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to send "new-download-link" email (${localAuthority}): ${
          (error as Error).message
        }`,
      }),
    );
  }
};
