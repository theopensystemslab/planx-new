import { usePrefetchClassifiedRoads } from "@planx/components/PlanningConstraints/Public/hooks/useClassifiedRoads";
import { useQuery } from "@tanstack/react-query";
import type { Feature } from "geojson";
import {
  getBuildingSafetyLevyRates,
  getFindPropertyData,
} from "lib/planningData/requests";
import { useMemo } from "react";

import type { SiteAddress } from "../../model";

interface FindPropertyData {
  localAuthorityDistricts?: string[];
  localPlanningAuthorities?: string[];
  regions?: string[];
  wards?: string[];
  parishes?: string[];
  developmentCorporations?: string[];
  titleBoundary?: Feature;
  bslRate?: {
    previouslyDevelopedLand: number;
    nonPreviouslyDevelopedLand: number;
  };
}

export const useFindPropertyData = (address?: SiteAddress) => {
  // Fetch data from planning.data.gov.uk
  const { data, isPending, error } = useQuery({
    queryKey: ["findProperty", address?.latitude, address?.longitude],
    queryFn: () =>
      getFindPropertyData({
        latitude: address!.latitude,
        longitude: address!.longitude,
      }),
    enabled: Boolean(address?.latitude && address?.longitude),
  });

  const { data: bslRates, isPending: isBSLRatesPending } = useQuery({
    queryKey: ["buildingSafetyLevyRates"],
    queryFn: getBuildingSafetyLevyRates,
    staleTime: Infinity,
  });

  // Calculate derived data required for component
  const findPropertyData = useMemo<FindPropertyData>(() => {
    if (!data) {
      return {
        localAuthorityDistricts: undefined,
        localPlanningAuthorities: undefined,
        regions: undefined,
        wards: undefined,
        parishes: undefined,
        developmentCorporations: undefined,
        titleBoundary: undefined,
        bslRate: undefined,
      };
    }

    const localAuthorityDistricts = new Set<string>();
    const localAuthorityDistrictCodes = new Set<string>();
    const localPlanningAuthorities = new Set<string>();
    const regions = new Set<string>();
    const wards = new Set<string>();
    const parishes = new Set<string>();
    const developmentCorporations = new Set<string>();
    let titleBoundary: Feature | undefined;

    data.features.forEach((feature) => {
      const { dataset, name, reference } = feature.properties;

      switch (dataset) {
        case "local-authority-district":
          localAuthorityDistricts.add(name);
          localAuthorityDistrictCodes.add(reference);
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
        case "parish":
          parishes.add(name);
          break;
        case "development-corporation-boundary":
          developmentCorporations.add(name);
          break;
        case "title-boundary":
          titleBoundary = feature;
          break;
      }
    });

    const localBSLRate = bslRates?.find((rate) =>
      localAuthorityDistrictCodes.has(rate["local-authority-district"]),
    );

    return {
      localAuthorityDistricts: Array.from(localAuthorityDistricts),
      localPlanningAuthorities: Array.from(localPlanningAuthorities),
      regions: Array.from(regions),
      wards: Array.from(wards),
      parishes: Array.from(parishes),
      developmentCorporations: Array.from(developmentCorporations),
      titleBoundary,
      bslRate: localBSLRate && {
        previouslyDevelopedLand: Number(
          localBSLRate["previously-developed-land-rate"],
        ),
        nonPreviouslyDevelopedLand: Number(
          localBSLRate["non-previously-developed-land-rate"],
        ),
      },
    };
  }, [data, bslRates]);

  // Side effect - As soon as we have a USR, pre-fetch classified roads data.
  // This is a long-running request, so prefetching in the background allows
  // us to reduce the overall wait time for the user
  usePrefetchClassifiedRoads(address?.usrn);

  return {
    ...findPropertyData,
    isPending: isPending || isBSLRatesPending,
    error,
  };
};
