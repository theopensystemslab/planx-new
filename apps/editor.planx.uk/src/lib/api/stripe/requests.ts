import apiClient from "../client";
import type {
  CreateStripeCheckoutSession,
  StripeCheckoutSession,
  StripeCheckoutSessionStatus,
  StripeConnectStatus,
  StripeMigrationAbility,
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

export const getStripeMigrationAbility = async (
  teamSlug: string,
): Promise<StripeMigrationAbility> => {
  const { data } = await apiClient.get<StripeMigrationAbility>(
    `/stripe/migration/${teamSlug}/status`,
  );
  return data;
};
