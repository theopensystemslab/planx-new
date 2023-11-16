import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";
import { resumeApplication } from "./service/resumeApplication";
import { LowCalSessionData } from "../../types";
import { findSession, validateSession } from "./service/validateSession";
import { PaymentRequest } from "@opensystemslab/planx-core/types";

interface ResumeApplicationResponse {
  message: string;
  expiryDate?: string | undefined;
}

export const resumeApplicationSchema = z.object({
  body: z.object({
    payload: z.object({
      teamSlug: z.string(),
      email: z.string().email(),
    }),
  }),
});

export type ResumeApplication = ValidatedRequestHandler<
  typeof resumeApplicationSchema,
  ResumeApplicationResponse
>;

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

export interface ValidationResponse {
  message: string;
  changesFound: boolean | null;
  alteredSectionIds?: Array<string>;
  reconciledSessionData: Omit<LowCalSessionData, "passport">;
}

interface LockedSessionResponse {
  message: "Session locked";
  paymentRequest?: Partial<
    Pick<PaymentRequest, "id" | "payeeEmail" | "payeeName">
  >;
}

export const validateSessionSchema = z.object({
  body: z.object({
    payload: z.object({
      sessionId: z.string(),
      email: z.string().email(),
    }),
  }),
});

export type ValidateSessionController = ValidatedRequestHandler<
  typeof validateSessionSchema,
  ValidationResponse | LockedSessionResponse
>;

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
