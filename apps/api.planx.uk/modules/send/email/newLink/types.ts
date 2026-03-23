import z from "zod";
import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

export const sendNewDownloadLinkSchema = z.object({
  body: z.object({
    localAuthority: z.string(),
    flowSlug: z.string(),
    sessionId: z.string().uuid(),
  }),
});

interface Success {
  message: "An email sent to your inbox";
}

interface Failure {
  error: "SESSION_NOT_FOUND" | "LINK_ALREADY_EMAILED" | "EMAIL_NOT_CONFIGURED";
}

export type Controller = ValidatedRequestHandler<
  typeof sendNewDownloadLinkSchema,
  Success | Failure
>;
