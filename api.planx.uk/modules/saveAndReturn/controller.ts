import { resumeApplication } from "./service/resumeApplication";
import { findSession, validateSession } from "./service/validateSession";
import { ResumeApplication, ValidateSessionController } from "./types";

export const validateSessionController: ValidateSessionController = async (
  _req,
  res,
  next,
) => {
  try {
    const { email, sessionId } = res.locals.parsedReq.body.payload;

    const fetchedSession = await findSession({
      sessionId,
      email: email.toLowerCase(),
    });

    if (!fetchedSession) {
      return next({
        status: 404,
        message: "Unable to find your session",
      });
    }

    if (fetchedSession.lockedAt) {
      return res.status(403).send({
        message: "Session locked",
        paymentRequest: {
          ...fetchedSession.paymentRequests?.[0],
        },
      });
    }
    const responseData = await validateSession(sessionId, fetchedSession);

    return res.status(200).json(responseData);
  } catch (error) {
    return next({
      error,
      message: "Failed to validate session",
    });
  }
};

export const resumeApplicationController: ResumeApplication = async (
  _req,
  res,
  next,
) => {
  try {
    const { teamSlug, email } = res.locals.parsedReq.body.payload;
    const response = await resumeApplication(teamSlug, email);
    return res.json(response);
  } catch (error) {
    return next({
      error,
      message: `Failed to send "Resume" email. ${(error as Error).message}`,
    });
  }
};
