import apiClient from "lib/api/client";

import type { CombinedEventsPayload, SendResponse } from "./types";

/**
 * Send makes a single request to create scheduled events in Hasura, then those events make the actual submission requests with retries etc
 */
export const createSendEvents = async ({
  sessionId,
  ...payload
}: CombinedEventsPayload & { sessionId: string }) => {
  const { data } = await apiClient.post<SendResponse>(
    `/create-send-events/${sessionId}`,
    payload,
  );
  return data;
};

export const downloadSubmission = async (token: string) => {
  const response = await apiClient.get<Blob>("/download-submission", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    responseType: "blob",
  });
  const blob = response.data;
  const disposition = response.headers["content-disposition"];
  const filename = disposition?.match(/filename=(.+)/)?.[1] ?? "submission.zip";
  return { blob, filename };
};
