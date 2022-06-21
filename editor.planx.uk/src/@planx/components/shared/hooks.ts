import { downloadFile } from "api/download";
import { useEffect, useState } from "react";

/**
 * Returns the team 'slug', which is currently always the first part
 * of the URL path.
 *
 * @example
 * // returns "southwark"
 * https://editor.planx.uk/southwark/flow/preview
 */
export const useTeamSlug = () => {
  // XXX: This should really be handled by navi, but it's not clear how.
  return window.location.pathname.match(/\/([^/]+)/)?.[1];
};

/**
 * Returns fileUrl for uploaded files, either private or public.
 */
export const useFileUrl = ({
  file,
  serverFile: { fileId, fileHash } = { fileId: "", fileHash: "" },
}: {
  file?: any;
  serverFile?: { fileId: string; fileHash: string };
}) => {
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

  return {
    fileUrl,
  };
};
