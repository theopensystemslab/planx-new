import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";

export const DOWNLOAD_APPLICATION_FILE_URL = `${
  import.meta.env.VITE_APP_API_URL
}/download-application-files`;

export interface DownloadApplicationFileResponse {
  data: Blob;
}
export const DOWNLOAD_APPLICATION_FILE_QUERY_KEY =
  "DOWNLOAD_APPLICATION_FILE/GET";

const useQueryApplicationFileDownload = (
  sessionId: string,
  email: string,
  team: string,
  options?: Readonly<
    Omit<
      UseQueryOptions<DownloadApplicationFileResponse>,
      "queryKey" | "queryFn"
    >
  >,
) => {
  return useQuery({
    queryKey: [DOWNLOAD_APPLICATION_FILE_QUERY_KEY, sessionId],
    queryFn: () =>
      axios({
        url: `${DOWNLOAD_APPLICATION_FILE_URL}/${sessionId}`,
        method: "GET",
        params: { email, localAuthority: team },
        responseType: "blob",
      }),
    ...options,
  });
};

export default useQueryApplicationFileDownload;
