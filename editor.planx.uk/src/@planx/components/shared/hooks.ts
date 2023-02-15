import { useEffect, useState } from "react";
import { useCurrentRoute } from "react-navi";

/**
 * Returns the team 'slug', which is currently always the first part
 * of the URL path.
 *
 * @example
 * // returns "southwark"
 * https://editor.planx.uk/southwark/flow/preview
 */
export const useTeamSlug = () => {
  const route = useCurrentRoute();
  return route?.data?.team;
};

export const useFlowName = () => {
  const route = useCurrentRoute();
  return route?.data?.flowName;
};

export type UseFileUrlProps =
  | { file: File }
  | { url: string }
  | { file: File; url: string };

/**
 * Returns fileUrl for uploaded files, either private or public.
 */
export const useFileUrl = (props: UseFileUrlProps) => {
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    if ("file" in props && props.file instanceof File) {
      setFileUrl(URL.createObjectURL(props.file));
    } else if ("url" in props && props.url) {
      // XXX: Backwards compatibility to accept files uploaded directly to S3.
      setFileUrl(props.url);
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
