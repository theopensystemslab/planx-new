import z from "zod";

import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";
import type { SendEmailResponse } from "../../../sendEmail/types.js";

export const remittanceEmailSchema = z.object({
  body: z.object({
    payload: z.array(
      z.object({
        team: z.string(),
        date: z.string(),
        email: z.email(),
      }),
    ),
  }),
});

export type RemittanceEmail = ValidatedRequestHandler<
  typeof remittanceEmailSchema,
  SendEmailResponse
>;

export type RemittanceEmailResult = {
  teamSlug: string;
  status: "sent" | "skipped" | "failed";
  error?: string;
};

export interface DailyRemittanceResponse {
  message: string;
  results: RemittanceEmailResult[];
}

export type DailyRemittanceController = ValidatedRequestHandler<
  z.ZodUndefined,
  DailyRemittanceResponse
>;
