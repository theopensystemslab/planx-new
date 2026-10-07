import apiClient from "lib/api/client";

import type {
  ReconciliationResponse,
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
 * Query DB to validate that sessionID & email match
 */
export const validateSession = async (body: SessionAuthPayload) => {
  const { data } = await apiClient.post<ReconciliationResponse>(
    "/validate-session",
    body,
  );
  return data;
};
