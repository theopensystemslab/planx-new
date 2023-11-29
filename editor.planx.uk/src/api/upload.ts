import axios, { RawAxiosRequestHeaders } from "axios";
import { getCookie } from "lib/cookie";

export { uploadPrivateFile, uploadPublicFile };

export type UploadFileResponse = string;

async function uploadPublicFile(
  file: any,
  { onProgress }: { onProgress?: (p: any) => void } = {},
) {
  const token = getCookie("jwt");
  const authRequestHeader = { Authorization: `Bearer ${token}` };
  const { data } = await handleUpload(
    file,
    { onProgress, path: "public" },
    authRequestHeader,
  );

  return data.fileUrl;
}

async function uploadPrivateFile(
  file: any,
  { onProgress }: { onProgress?: (p: any) => void } = {},
) {
  const { data } = await handleUpload(file, { onProgress, path: "private" });

  return data.fileUrl;
}

function handleUpload(
  file: any,
  {
    onProgress,
    path: path,
  }: { onProgress?: (p: any) => void; path: "public" | "private" },
  authHeader?: RawAxiosRequestHeaders,
) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("filename", file.name);

  // Private uploads for test applications should be handled by the staging environment
  const paths = {
    public: `${process.env.REACT_APP_API_URL}/file/public/upload`,
    private: `${process.env.REACT_APP_API_URL}/file/private/upload`,
  };

  const endpoint = paths[path];

  return axios.post(endpoint, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      ...(authHeader && authHeader),
    },
    onUploadProgress: ({ loaded, total }) => {
      if (onProgress && total) {
        onProgress(loaded / total);
      }
    },
  });
}
