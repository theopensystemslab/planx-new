import { z } from "zod";

import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

interface Success {
  token: string;
}

interface Error {
  error: string;
}

export const generateDownloadTokenSchema = z.object({
  body: z.object({
    email: z.email(),
    sessionId: z.uuid(),
  }),
});

export type GenerateDownloadToken = ValidatedRequestHandler<
  typeof generateDownloadTokenSchema,
  Success | Error
>;
