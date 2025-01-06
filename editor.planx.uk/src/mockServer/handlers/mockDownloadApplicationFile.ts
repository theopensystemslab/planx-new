import { http, HttpResponse } from "msw";
import { DOWNLOAD_APPLICATION_FILE_URL } from "pages/SubmissionDownload/VerifySubmissionEmail";

export const mockData = new ArrayBuffer(100); // a byte number is needed

export const getWithData = http.get(
  `${DOWNLOAD_APPLICATION_FILE_URL}/a-session-id/?email=submission%40council.com&localAuthority=barking-and-dagenham`,
  () => {
    return new HttpResponse(mockData, { status: 200 });
  },
);

export const getWithServerSideError = http.get(
  `${DOWNLOAD_APPLICATION_FILE_URL}/a-session-id/?email=submission%40council.com&localAuthority=barking-and-dagenham`,
  () => {
    return new HttpResponse(null, { status: 500 });
  },
);

export const getWith403 = http.get(
  `${DOWNLOAD_APPLICATION_FILE_URL}/a-session-id/?email=wrong_email%40council.com&localAuthority=barking-and-dagenham`,
  () => {
    return new HttpResponse(null, { status: 403 });
  },
);
