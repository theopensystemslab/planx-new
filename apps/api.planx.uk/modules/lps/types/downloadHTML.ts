import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

type Success = string;

interface Failure {
  error:
    | "DOWNLOAD_TOKEN_INVALID"
    | "DOWNLOAD_TOKEN_CONSUMED"
    | "DOWNLOAD_TOKEN_EXPIRED";
  message: string;
}

export const downloadHTMLSchema = z.object({
  headers: z.object({
    authorization: z
      .string({ message: "Authorization headers are required" })
      .startsWith("Bearer ", "Invalid token format")
      .transform((val) => val.replace("Bearer ", "")),
  }),
  body: z.object({
    email: z.string().email(),
    sessionId: z.string().uuid(),
  }),
});

export type DownloadHTML = ValidatedRequestHandler<
  typeof downloadHTMLSchema,
  Success | Failure
>;
