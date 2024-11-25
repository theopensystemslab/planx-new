import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import axios from "axios";

export const DOWNLOAD_APPLICATION_FILE_URL = `${
  import.meta.env.VITE_APP_API_URL
}/download-application-files`;

// TODO: fix the typing
// type DownloadApplicationFileResponse = Blob;
// interface DownloadApplicationFileResponse {
//   data: Blob;
// }

const DOWNLOAD_APPLICATION_FILE_QUERY_KEY = "DOWNLOAD_APPLICATION_FILE/GET";

const useQueryApplicationFileDownload = (
  sessionId: string,
  email: string,
  team: string,
  options?: Readonly<Omit<UseQueryOptions, "queryKey" | "queryFn">>
) => {
  //   return useQuery<DownloadApplicationFileResponse>({
  return useQuery({
    queryKey: [DOWNLOAD_APPLICATION_FILE_QUERY_KEY, sessionId],
    queryFn: () =>
      //   axios<DownloadApplicationFileResponse>({
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
