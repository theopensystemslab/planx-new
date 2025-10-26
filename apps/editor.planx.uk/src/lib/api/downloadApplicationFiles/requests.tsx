import apiClient from "lib/api/client";

interface DownloadApplicationFiles {
  sessionId: string;
  email: string;
  localAuthority: string;
}

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
