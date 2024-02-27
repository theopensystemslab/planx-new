import { z } from "zod";
import { ValidatedRequestHandler } from "../../shared/middleware/validate";
import { LowCalSessionData } from "../../types";
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
