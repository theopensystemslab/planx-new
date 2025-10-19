import apiClient from "api/client";

import {
  SendEmailPayload,
  SendResumeEmailPayload,
  SendSaveEmailResponse,
} from "./types";

export const sendSaveEmail = async (body: SendEmailPayload) => {
  const { data } = await apiClient.post<SendSaveEmailResponse>(
    "send-email/save",
    body,
  );
  return data;
};

/**
 * Send magic link to user, based on submitted email
 * Sets page status based on validation of request by API
 */
export const sendResumeEmail = async (body: SendResumeEmailPayload) => {
  await apiClient.post("/resume-application", body);
};
