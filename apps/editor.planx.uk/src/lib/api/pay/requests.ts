import type { GovUKPayment } from "@opensystemslab/planx-core/types";

import apiClient from "../client";
import type { GetPayment, InitiatePayment } from "./types";

export const getPayment = async ({
  teamSlug,
  sessionId,
  flowId,
  paymentId,
}: GetPayment): Promise<GovUKPayment> => {
  const { data } = await apiClient.get<GovUKPayment>(
    `/pay/${teamSlug}/${paymentId}`,
    { params: { sessionId, flowId } },
  );

  return data;
};

export const initiatePayment = async ({
  teamSlug,
  sessionId,
  flowId,
  payload,
}: InitiatePayment): Promise<GovUKPayment> => {
  const { data } = await apiClient.post<GovUKPayment>(
    `/pay/${teamSlug}`,
    payload,
    { params: { sessionId, flowId } },
  );

  return data;
};
