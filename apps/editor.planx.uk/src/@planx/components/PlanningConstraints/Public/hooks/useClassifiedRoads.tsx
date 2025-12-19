import { ComponentType } from "@opensystemslab/planx-core/types";
import type { SiteAddress } from "@planx/components/FindProperty/model";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getClassifiedRoads } from "lib/api/gis/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import { useEffect } from "react";

import type { PlanningConstraints } from "../../model";

export const useClassifiedRoads = (dataValues: string[]) => {
  const [hasPlanningData, { usrn }] = useStore((state) => [
    state.teamIntegrations?.hasPlanningData,
    (state.computePassport().data?.["_address"] as SiteAddress) || {},
  ]);

  // If an OS address was selected, additionally fetch classified roads (available nationally) using the USRN identifier,
  //   skip if the applicant plotted a new non-UPRN address on the map
  const shouldFetchRoads =
    hasPlanningData && Boolean(usrn) && dataValues.includes("road.classified");

  const query = useQuery({
    queryKey: ["classifiedRoads", usrn],
    queryFn: () => getClassifiedRoads(usrn),
    enabled: shouldFetchRoads,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  return query;
};

/**
 * Prefetch the expensive "classified roads" query in order to reduce the overall latency for the user
 * Triggered as soon as the user selects an address with USRN in useFindPropertyData()
 */
export const usePrefetchClassifiedRoads = (usrn?: string) => {
  const queryClient = useQueryClient();

  const [hasPlanningData, flow] = useStore((state) => [
    state.teamIntegrations?.hasPlanningData,
    state.flow,
  ]);

  // Validation rules enforce that each graph can only contain a single PlanningConstraints node
  const planningConstraintsNode = Object.values(flow).find(
    ({ type }) => type === ComponentType.PlanningConstraints,
  );

  const dataValues = (planningConstraintsNode?.data as PlanningConstraints)
    ?.dataValues;

  useEffect(() => {
    const shouldPrefetch =
      hasPlanningData &&
      Boolean(usrn) &&
      dataValues.includes("road.classified");

    if (shouldPrefetch) {
      queryClient.prefetchQuery({
        queryKey: ["classifiedRoads", usrn],
        queryFn: () => getClassifiedRoads(usrn),
        staleTime: Infinity,
      });
    }
  }, [usrn, queryClient]);
};
