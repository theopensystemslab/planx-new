import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";
import { resumeApplication } from "./service/resumeApplication";

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
