import type { GovUKCreatePaymentPayload } from "@opensystemslab/planx-core/types";

export interface GetPayment {
  teamSlug: string;
  paymentId: string;
  sessionId: string;
  flowId: string;
}
export interface InitiatePayment {
  teamSlug: string;
  sessionId: string;
  flowId: string;
  payload: GovUKCreatePaymentPayload;
}

export interface GetITPPayment {
  paymentRequestId: string;
  govPayPaymentId: string;
}

export interface InitiateITPPayment {
  paymentRequestId: string;
  returnURL: string;
}
