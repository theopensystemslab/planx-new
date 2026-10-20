import type { APIError } from "../client";
import apiClient from "../client";
import type {
  CreateStripeCheckoutSession,
  FulfilPaymentRequest,
  FulfilPaymentRequestResult,
  StripeCanMigrate,
  StripeCheckoutSession,
  StripeCheckoutSessionStatus,
  StripeConnectStatus,
} from "./types";

export const getStripeConnectStatus = async (
  teamSlug: string,
): Promise<StripeConnectStatus> => {
  const { data } = await apiClient.get<StripeConnectStatus>(
    `/stripe/connect/${teamSlug}/status`,
  );

  return data;
};

export const createStripeCheckoutSession = async ({
  teamSlug,
  ...body
}: CreateStripeCheckoutSession): Promise<StripeCheckoutSession> => {
  const { data } = await apiClient.post<StripeCheckoutSession>(
    `/stripe/checkout-session/${teamSlug}`,
    body,
  );

  return data;
};

export const getStripeCheckoutSessionStatus = async ({
  teamSlug,
  checkoutSessionId,
}: {
  teamSlug: string;
  checkoutSessionId: string;
}): Promise<StripeCheckoutSessionStatus> => {
  const { data } = await apiClient.get<StripeCheckoutSessionStatus>(
    `/stripe/checkout-session/${teamSlug}/${checkoutSessionId}`,
  );

  return data;
};

/**
 * Invite to pay: create the payer's Checkout Session from the payment request
 */
export const createPaymentRequestCheckoutSession = async (
  paymentRequestId: string,
): Promise<StripeCheckoutSession> => {
  const { data } = await apiClient.post<StripeCheckoutSession>(
    `/stripe/payment-request/${paymentRequestId}/checkout-session`,
  );

  return data;
};

/**
 * Invite to pay: confirm the payer's Checkout Session when they return from Stripe
 */
export const fulfilPaymentRequest = async ({
  paymentRequestId,
  checkoutSessionId,
}: FulfilPaymentRequest): Promise<FulfilPaymentRequestResult> => {
  const { data } = await apiClient.post<FulfilPaymentRequestResult>(
    `/stripe/payment-request/${paymentRequestId}/fulfil`,
    { checkoutSessionId },
  );

  return data;
};

export const migrateToStripe = async (
  teamSlug: string,
): Promise<StripeCanMigrate> => {
  try {
    const { data } = await apiClient.post<StripeCanMigrate>(
      `/stripe/migrate/${teamSlug}`,
    );
    return data;
  } catch (err) {
    const apiError = err as APIError<StripeCanMigrate>;
    if (apiError.statusCode === 409 && apiError.data) {
      return apiError.data;
    }
    throw err;
  }
};
