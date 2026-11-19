import type {
  GOV_PAY_PASSPORT_KEY,
  PaymentStatus,
} from "@opensystemslab/planx-core/types";

export const STRIPE_PASSPORT_KEY = "application.fee.reference.stripe";

/**
 * Set when the applicant has completed an async payment (e.g. Bacs Direct Debit)
 */
export const PAYMENT_PROCESSING_PASSPORT_KEY = "_paymentProcessing";

export interface PaymentActions {
  startNewPayment: () => Promise<void>;
  refetchPayment: () => Promise<void>;
  resumeExistingPayment: () => Promise<void>;
  handleSuccess: () => void;
}

export interface UsePaymentProviderResult {
  actions: PaymentActions;
  passportKey?: typeof GOV_PAY_PASSPORT_KEY | typeof STRIPE_PASSPORT_KEY;
  hasExistingPayment: boolean;
  existingPaymentStatus?: PaymentStatus;
}
