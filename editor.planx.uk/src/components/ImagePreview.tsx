import { downloadFile } from "api/download";
import React, { useEffect, useState } from "react";

export default function ImagePreview({
  file,
  serverFile: { fileId = "", fileHash = "" } = {},
}: any) {
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    if (file instanceof File) {
      setFileUrl(URL.createObjectURL(file));
    } else if (fileId && fileHash) {
      downloadFile(fileId, fileHash).then((f) => {
        setFileUrl(URL.createObjectURL(f));
      });
    }

    return () => {
      if (fileUrl) {
        // Cleanup to free up memory
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, []);

  return <img src={fileUrl} alt="" />;
}
