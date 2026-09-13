import apiClient from "../client";
import type { StripeConnectStatus } from "./types";

export const getStripeConnectStatus = async (
  teamSlug: string,
): Promise<StripeConnectStatus> => {
  const { data } = await apiClient.get<StripeConnectStatus>(
    `/stripe/connect/${teamSlug}/status`,
  );

  return data;
};
