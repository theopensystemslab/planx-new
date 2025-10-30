import { KeyPath, PaymentRequest } from "@opensystemslab/planx-core/types";
import apiClient from "lib/api/client";

export type CreatePaymentRequest = {
  payeeName: string;
  payeeEmail: string;
  applicantName: string;
  sessionPreviewKeys: Array<KeyPath>;
};

export const generateInviteToPayRequest = async ({
  sessionId,
  ...body
}: { sessionId: string } & CreatePaymentRequest) => {
  const url = `${import.meta.env.VITE_APP_API_URL}/invite-to-pay/${sessionId}`;
  const { data } = await apiClient.post<PaymentRequest>(url, body);
  return data;
};
