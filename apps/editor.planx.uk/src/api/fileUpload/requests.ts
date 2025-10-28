import apiClient from "api/client";
import { AxiosProgressEvent } from "axios";

import { UploadFileResponse, UploadFunction, UploadHandler } from "./types";

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
