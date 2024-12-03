import { http, HttpResponse } from "msw";
import {
  DOWNLOAD_APPLICATION_FILE_URL,
  DownloadApplicationFileResponse,
} from "pages/SubmissionDownload/queries/useQueryApplicationFileDownload";

type DownloadApplicationParams = {
  sessionId: string;
  email: string;
  localAuthority: string;
};

const MOCK_GET_APPLICATION_FILE_DOWNLOAD_ENDPOINT = `${DOWNLOAD_APPLICATION_FILE_URL}/1`;

const MOCK_GET_APPLICATION_FILE_DOWNLOAD_RESPONSE = {
  data: new Blob(["some binary data"]),
};

export const mockGetApplicationDownload = http.get<
  DownloadApplicationParams,
  DownloadApplicationFileResponse
>(MOCK_GET_APPLICATION_FILE_DOWNLOAD_ENDPOINT, ({ request }) => {
  const params = new URL(request.url).searchParams;
  console.log("mocking the endpoint!", params);
  return HttpResponse.json(MOCK_GET_APPLICATION_FILE_DOWNLOAD_RESPONSE, {
    status: 200,
  });
});
