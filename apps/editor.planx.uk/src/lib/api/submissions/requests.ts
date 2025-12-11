import apiClient from "lib/api/client";

import type { DownloadApplicationFiles } from "./types";

export const downloadApplicationFiles = async ({
  email,
  localAuthority,
  sessionId,
}: DownloadApplicationFiles) => {
  const { data } = await apiClient.get(
    `/download-application-files/${sessionId}`,
    {
      responseType: "arraybuffer",
      params: { email, localAuthority },
    },
  );

  return data;
};

export const getSubmissionHTML = async (sessionId: string) => {
  const { data } = await apiClient.get<string>(`/submission/${sessionId}/html`);

  return data;
};
