export type UploadFileResponse = {
  fileUrl: string;
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
