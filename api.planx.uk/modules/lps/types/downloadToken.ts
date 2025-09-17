import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

interface GenerateDownloadTokenResponse {
  token: string;
}

export const generateDownloadTokenSchema = z.object({
  body: z.object({
    email: z.string().email(),
    sessionId: z.string().uuid(),
  }),
});

export type GenerateDownloadToken = ValidatedRequestHandler<
  typeof generateDownloadTokenSchema,
  GenerateDownloadTokenResponse
>;
