import { z } from "zod";
import type { ValidatedRequestHandler } from "../../../shared/middleware/validate.js";

/**
 * Formatted data for consumption by LPS frontend
 */
interface LPSApplication {
  id: string;
  service: {
    name: string;
  };
  team: {
    name: string;
  };
  address: string | null;
  createdAt: string;
  updatedAt: string;
  /** Only services which use Section components will have values for progress */
  progress?: {
    completed: number;
  };
  expiresAt: string;
}

export type DraftLPSApplication = LPSApplication & {
  serviceUrl: string;
};

export type AwaitingPaymentLPSApplication = LPSApplication & {
  paymentUrl: string;
};

export type SubmittedLPSApplication = LPSApplication & {
  submittedAt: string;
};

export type Success = Array<
  DraftLPSApplication | AwaitingPaymentLPSApplication | SubmittedLPSApplication
>;

interface Failure {
  error: "LINK_INVALID" | "LINK_CONSUMED" | "LINK_EXPIRED";
  message: string;
}

export const applicationsSchema = z.object({
  body: z.object({
    email: z.string().email(),
    token: z.string().uuid(),
  }),
});

export type Applications = ValidatedRequestHandler<
  typeof applicationsSchema,
  Success | Failure
>;
