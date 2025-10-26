import apiClient from "lib/api/client";

import {
  ReconciliationResponse,
  SendResumeEmailPayload,
  SendSaveEmailResponse,
  SessionAuthPayload,
} from "./types";

export const sendSaveEmail = async (body: SessionAuthPayload) => {
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

/**
 * Query DB to validate that sessionID & email match
 */
export const validateSession = async (body: SessionAuthPayload) => {
  const { data } = await apiClient.post<ReconciliationResponse>(
    "/validate-session",
    body,
  );
  return data;
};
