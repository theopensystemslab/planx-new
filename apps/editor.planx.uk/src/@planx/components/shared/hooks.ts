import { useQuery } from "@tanstack/react-query";
import {
  getEntityNames,
  getPlanningConstraintsSchema,
} from "lib/planningData/requests";
import { useEffect, useState } from "react";

export type UseFileUrlProps = { file: File };

/**
 * Returns a local object URL for a file the user has just selected.
 *
 * Deliberately only ever resolves to a `blob:` URL for an in-memory File - it must not be given
 * a remote URL to hand back. Rendering a stored file inline would mean loading user-uploaded
 * bytes into our own origin, which is precisely what we don't want to do.
 */
export const useFileUrl = ({ file }: UseFileUrlProps) => {
  const [fileUrl, setFileUrl] = useState("");

  useEffect(() => {
    if (file instanceof File) {
      setFileUrl(URL.createObjectURL(file));
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

export const usePlanningConstraintsSchema = (fn: string, teamSlug?: string) => {
  return useQuery({
    queryKey: [`planning-constraints-${teamSlug ?? "default"}`],
    queryFn: () => getPlanningConstraintsSchema(teamSlug),
    enabled: fn === "property.constraints.planning",
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
};
