import { z } from "zod";
import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

interface LoginResponse {
  message: string;
}

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export type Login = ValidatedRequestHandler<typeof loginSchema, LoginResponse>;

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
}

export type DraftLPSApplication = LPSApplication & {
  expiresAt: string;
  serviceUrl: string;
};

export type AwaitingPaymentLPSApplication = LPSApplication & {
  expiresAt: string;
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
