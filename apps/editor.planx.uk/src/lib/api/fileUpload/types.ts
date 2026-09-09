export type UploadFileResponse = {
  fileUrl: string;
};

/**
 * Outcome of waiting for an uploaded file to become servable.
 *
 * ready - the API served it, so it can be handed to an <img> or saved
 * pending - still awaiting its malware scan when we gave up waiting; URL is worth keeping
 * rejected - flagged by the scan, or gone; waiting longer cannot help
 */
export type FileWaitStatus = "ready" | "pending" | "rejected";

export type FileWaitResult = {
  status: FileWaitStatus;
};

export type UploadFunction = (
  file: File,
  onProgress?: (progress: number) => void,
) => Promise<UploadFileResponse>;

export type UploadHandler = (
  file: File,
  endpoint: "/file/private/upload" | "/file/public/upload",
  onProgress?: (progress: number) => void,
) => Promise<UploadFileResponse>;
