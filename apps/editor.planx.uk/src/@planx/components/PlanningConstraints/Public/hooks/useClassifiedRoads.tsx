import type { SiteAddress } from "@planx/components/FindProperty/model";
import { useQuery } from "@tanstack/react-query";
import { getClassifiedRoads } from "lib/api/gis/requests";
import { useStore } from "pages/FlowEditor/lib/store";

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
  });

  return query;
};
