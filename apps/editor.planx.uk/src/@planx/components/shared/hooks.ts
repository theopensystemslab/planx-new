import { useQuery } from "@tanstack/react-query";
import { getEntityNames } from "lib/planningData/requests";
import { useEffect, useState } from "react";

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

export const usePlanningDataEntityNames = (fn: string) => {
  const fnToDataset: Record<string, string> = {
    "property.localAuthorityDistrict": "local-authority-district",
    "property.localPlanningAuthority": "local-planning-authority",
    "property.region": "region",
    "property.developmentCorporation": "development-corporation",
    // "property.ward": "ward" // only 'turn on' once we setup query pagination and if UI is okay (current PD API limit = 500, but there's ~7k wards)
  };

  const query = useQuery({
    queryKey: [fnToDataset[fn]],
    queryFn: () => getEntityNames(fnToDataset[fn]),
    enabled: Object.keys(fnToDataset).includes(fn),
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return query;
};
