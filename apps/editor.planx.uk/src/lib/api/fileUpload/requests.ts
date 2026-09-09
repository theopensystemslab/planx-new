import type { AxiosProgressEvent } from "axios";
import apiClient from "lib/api/client";

import type {
  FileWaitResult,
  UploadFileResponse,
  UploadFunction,
  UploadHandler,
} from "./types";

const handleUpload: UploadHandler = async (file, endpoint, onProgress) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("filename", file.name);

  const { data } = await apiClient.post<UploadFileResponse>(
    endpoint,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: ({ loaded, total }: AxiosProgressEvent) => {
        if (onProgress && total) {
          onProgress(loaded / total);
        }
      },
    },
  );

  return data;
};

export const uploadPrivateFile: UploadFunction = async (file, onProgress) =>
  handleUpload(file, "/file/private/upload", onProgress);

export const uploadPublicFile: UploadFunction = async (file, onProgress) =>
  handleUpload(file, "/file/public/upload", onProgress);

/**
 * Delay before each retry when waiting for an uploaded file to become servable.
 *
 * Most objects are scanned in less than 3s, but it can take significantly longer,
 * so we ramp up the delay after each attempt, ending on the API's blanket 30s `Retry-After`.
 */
export const DEFAULT_POLL_DELAYS_MS = [
  1_000, 2_000, 4_000, 8_000, 15_000, 30_000, 30_000,
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Wait until an uploaded file can actually be fetched.
 *
 * An upload's 200 only means bytes reached S3. The API will not serve a file until Scanii has tagged it,
 * answering `503 FILE_SCAN_PENDING` with a `Retry-After` until then, so an URL handed back will be broken
 * for as long as the scan takes. Callers should wait on this before treating an upload as complete.
 *
 * Bonus: `delaysMs` is injectable so tests need no fake timers.
 */
export const waitForPublicFile = async (
  fileUrl: string,
  { delaysMs = DEFAULT_POLL_DELAYS_MS }: { delaysMs?: number[] } = {},
): Promise<FileWaitResult> => {
  let attempt = 0;
  while (true) {
    const { status, headers } = await apiClient.get(fileUrl, {
      validateStatus: (status) => [200, 404, 503].includes(status),
    });

    if (status === 200) return { status: "ready" };
    // FILE_FLAGGED or FILE_NOT_FOUND - no amount of waiting will help
    if (status === 404) return { status: "rejected" };
    if (attempt >= delaysMs.length) return { status: "pending" };

    // we only defer to the header when it asks for *less* than planned
    const retryAfterMs = Number(headers["retry-after"]) * 1000;
    const plannedMs = delaysMs[attempt++];
    await sleep(
      Number.isFinite(retryAfterMs) && retryAfterMs >= 0
        ? Math.min(retryAfterMs, plannedMs)
        : plannedMs,
    );
  }
};
