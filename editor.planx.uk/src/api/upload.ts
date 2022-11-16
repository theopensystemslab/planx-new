import axios from "axios";

import { encodeS3URI } from "./encode";

export { uploadPrivateFile, uploadPublicFile };

export type UploadFileResponse = string;

async function uploadPublicFile(
  file: any,
  { onProgress }: { onProgress?: (p: any) => void } = {}
) {
  const { data } = await handleUpload(file, { onProgress, path: "public" });

  return `${process.env.REACT_APP_API_URL}/file/public/${encodeS3URI(
    data.key
  )}`;
}

async function uploadPrivateFile(
  file: any,
  { onProgress }: { onProgress?: (p: any) => void } = {}
) {
  const { data } = await handleUpload(file, { onProgress, path: "private" });

  return `${process.env.REACT_APP_API_URL}/file/private/${encodeS3URI(
    data.key
  )}`;
}

function handleUpload(
  file: any,
  {
    onProgress,
    path: path,
  }: { onProgress?: (p: any) => void; path: "public" | "private" }
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("filename", file.name);

  const paths = {
    public: "public-file-upload",
    private: "private-file-upload",
  };

  const endpoint = paths[path];

  return axios.post(`${process.env.REACT_APP_API_URL}/${endpoint}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: ({ loaded, total }) => {
      if (onProgress) {
        onProgress(loaded / total);
      }
    },
  });
}
