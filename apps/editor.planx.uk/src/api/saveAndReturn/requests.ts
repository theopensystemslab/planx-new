import apiClient from "api/client";

import { SendEmailPayload, SendSaveEmailResponse } from "./types";

export const sendSaveEmail = async (body: SendEmailPayload) => {
  const { data } = await apiClient.post<SendSaveEmailResponse>(
    "send-email/save",
    body,
  );
  return data;
};
