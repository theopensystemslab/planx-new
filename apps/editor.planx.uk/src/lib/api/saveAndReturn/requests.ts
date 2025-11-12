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

/**
 * Get download token for HTML export
 */
export const getDownloadToken = async (email: string, sessionId: string): Promise<string> => {
  if (!email) {
    throw new Error("Missing email value.");
  }
  if (!sessionId) {
    throw new Error("Missing sessionId value.");
  }

  const response = await apiClient.post(
    `/lps/download/token`,
    {
      email,
      sessionId,
    }
  );

  if (response.status !== 200) {
    throw new Error(`Token request failed: ${response.status}`);
  }
  
  return response.data.token;
};

/**
 * Download application HTML using authorization token
 */
export const downloadApplicationHtml = async (
  email: string,
  sessionId: string,
  token: string
): Promise<string> => {
  const response = await apiClient.post(
    `/lps/download/html`,
    {
      email,
      sessionId,
    },
    {
      headers: {
        "Authorization": `Bearer ${token}`,
        "content-type": "application/json",
      },
    }
  );

  if (response.status !== 200) {
    throw new Error(`HTML request failed: ${response.status}`);
  }

  return response.data;
};