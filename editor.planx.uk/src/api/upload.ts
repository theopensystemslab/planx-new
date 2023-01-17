import { useStagingUrlIfTestApplication } from "@planx/components/shared/utils";
import axios from "axios";
import { useStore } from "pages/FlowEditor/lib/store";

export { uploadPrivateFile, uploadPublicFile };

export type UploadFileResponse = string;

async function uploadPublicFile(
  file: any,
  { onProgress }: { onProgress?: (p: any) => void } = {}
) {
  const { data } = await handleUpload(file, { onProgress, path: "public" });

  return data.fileUrl;
}

async function uploadPrivateFile(
  file: any,
  { onProgress }: { onProgress?: (p: any) => void } = {}
) {
  const { data } = await handleUpload(file, { onProgress, path: "private" });

  return data.fileUrl;
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

  const passport = useStore.getState().computePassport();

  // Private uploads for test applications should be handled by the staging environment
  const paths = {
    public: `${process.env.REACT_APP_API_URL}/public-file-upload`,
    private: useStagingUrlIfTestApplication(passport)(
      `${process.env.REACT_APP_API_URL}/private-file-upload`
    ),
  };

  const endpoint = paths[path];

  return axios.post(endpoint, formData, {
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
