import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

export const schema = z.object({
  body: z.object({
    original: z.string().trim().max(250),
  }),
});

interface Success {
  original: string;
  suggested: string;
}

export type ErrorStatus = "INVALID_DESCRIPTION" | "SERVICE_UNAVAILABLE";

interface Failure {
  error: ErrorStatus;
  message: string;
}

export type Controller = ValidatedRequestHandler<
  typeof schema,
  Success | Failure
>;
