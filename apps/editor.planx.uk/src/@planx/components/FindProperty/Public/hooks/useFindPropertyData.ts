import { SiteAddress } from "@opensystemslab/planx-core/types";
import { useQuery } from "@tanstack/react-query";
import { Feature } from "geojson";
import { getFindPropertyData } from "lib/planningData/requests";
import { useMemo } from "react";

interface FindPropertyData {
  localAuthorityDistricts?: string[];
  localPlanningAuthorities?: string[];
  regions?: string[];
  wards?: string[];
  titleBoundary?: Feature;
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

  return {
    ...findPropertyData,
    isPending,
    error,
  };
}