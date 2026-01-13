import { usePrefetchClassifiedRoads } from "@planx/components/PlanningConstraints/Public/hooks/useClassifiedRoads";
import { useQuery } from "@tanstack/react-query";
import { Feature } from "geojson";
import { getFindPropertyData } from "lib/planningData/requests";
import { useMemo } from "react";

import type { SiteAddress } from "../../model";

interface FindPropertyData {
  localAuthorityDistricts?: string[];
  localPlanningAuthorities?: string[];
  regions?: string[];
  wards?: string[];
  titleBoundary?: Feature;
}

// Wales: hardcode teams
const WALES_TEAMS = ["bannau-brycheiniog"];

function isWalesTeam(teamSlug?: string): boolean {
  return teamSlug ? WALES_TEAMS.includes(teamSlug) : false;
}

export const useFindPropertyData = (
  address?: SiteAddress,
  teamSlug?: string,
) => {
  // Wales: Skip planning.data.gov.uk call
  const shouldFetchPlanningData = !isWalesTeam(teamSlug);

  // Fetch data from planning.data.gov.uk
  const { data, isPending, error } = useQuery({
    queryKey: ["findProperty", address?.latitude, address?.longitude],
    queryFn: () =>
      getFindPropertyData({
        latitude: address!.latitude,
        longitude: address!.longitude,
      }),
    enabled:
      Boolean(address?.latitude && address?.longitude) &&
      shouldFetchPlanningData,
  });

  // Calculate derived data required for component
  const findPropertyData = useMemo<FindPropertyData>(() => {
    if (!data) {
      return {
        localAuthorityDistricts: undefined,
        localPlanningAuthorities: undefined,
        regions: undefined,
        wards: undefined,
        titleBoundary: undefined,
      };
    }

    const localAuthorityDistricts = new Set<string>();
    const localPlanningAuthorities = new Set<string>();
    const regions = new Set<string>();
    const wards = new Set<string>();
    let titleBoundary: Feature | undefined;

    data.features.forEach((feature) => {
      const { dataset, name } = feature.properties;

      switch (dataset) {
        case "local-authority-district":
          localAuthorityDistricts.add(name);
          break;
        case "local-planning-authority":
          localPlanningAuthorities.add(name);
          break;
        case "region":
          regions.add(name);
          break;
        case "ward":
          wards.add(name);
          break;
        case "title-boundary":
          titleBoundary = feature;
          break;
      }
    });

    return {
      localAuthorityDistricts: Array.from(localAuthorityDistricts),
      localPlanningAuthorities: Array.from(localPlanningAuthorities),
      regions: Array.from(regions),
      wards: Array.from(wards),
      titleBoundary,
    };
  }, [data]);

  // Side effect - As soon as we have a USR, pre-fetch classified roads data.
  // This is a long-running request, so prefetching in the background allows
  // us to reduce the overall wait time for the user
  usePrefetchClassifiedRoads(address?.usrn);

  // Wales: return null data with isPending: false
  if (!shouldFetchPlanningData) {
    return {
      localAuthorityDistricts: undefined,
      localPlanningAuthorities: undefined,
      regions: undefined,
      wards: undefined,
      titleBoundary: undefined,
      isPending: false,
      error: undefined,
    };
  }

  return {
    ...findPropertyData,
    isPending,
    error,
  };
};
