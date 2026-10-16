import type { GovUKPayment } from "@opensystemslab/planx-core/types";

import apiClient from "../client";
import type {
  GetITPPayment,
  GetPayment,
  InitiateITPPayment,
  InitiatePayment,
} from "./types";

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

export const getITPPayment = async ({
  paymentRequestId,
  govPayPaymentId,
}: GetITPPayment): Promise<GovUKPayment> => {
  const { data } = await apiClient.get<GovUKPayment>(
    `/payment-request/${paymentRequestId}/payment/${govPayPaymentId}`,
  );

  return data;
};

export const initiateITPPayment = async ({
  paymentRequestId,
  returnURL,
}: InitiateITPPayment): Promise<GovUKPayment> => {
  const { data } = await apiClient.post<GovUKPayment>(
    `/payment-request/${paymentRequestId}/pay?returnURL=${encodeURIComponent(
      returnURL,
    )}`,
  );

  return data;
};
