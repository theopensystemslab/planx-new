import type { z } from "zod";

import type { ValidatedRequestHandler } from "../../../../shared/middleware/validate.js";

export interface ReconcilePaymentsResponse {
  message: string;
  checked: number;
  unsubmitted: number;
  errors: string[];
}

export type ReconcilePaymentsController = ValidatedRequestHandler<
  z.ZodUndefined,
  ReconcilePaymentsResponse
>;

/** A session which began a payment but has never been submitted */
export interface PaymentCandidate {
  sessionId: string;
  flowId: string;
  flowName: string;
  teamSlug: string;
  teamName: string;
  paymentId: string;
  /** The most recent status we have recorded locally, which may be out of date */
  status: string;
  /** In pence */
  amount: number;
}
