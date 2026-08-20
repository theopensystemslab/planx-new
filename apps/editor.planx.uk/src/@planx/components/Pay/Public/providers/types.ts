import type { GOV_PAY_PASSPORT_KEY } from "@opensystemslab/planx-core/types";

export type PaymentProviderName = "govpay" | "stripe";

export const STRIPE_PASSPORT_KEY = "application.fee.reference.stripe";

export interface PaymentActions {
  startNewPayment: () => Promise<void>;
  refetchPayment: () => Promise<void>;
  resumeExistingPayment: () => Promise<void>;
  handleSuccess: () => void;
}

export interface UsePaymentProviderResult {
  actions: PaymentActions;
  passportKey: typeof GOV_PAY_PASSPORT_KEY | typeof STRIPE_PASSPORT_KEY;
  hasExistingPayment: boolean;
}
