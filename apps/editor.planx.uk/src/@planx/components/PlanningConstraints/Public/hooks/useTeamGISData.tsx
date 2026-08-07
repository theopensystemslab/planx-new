import type { SiteAddress } from "@opensystemslab/planx-core/types";
import { useQuery } from "@tanstack/react-query";
import { getTeamGISData } from "lib/api/gis/requests";
import { useStore } from "pages/FlowEditor/lib/store";
import { stringify } from "wkt";

export const useTeamGISData = (dataValues: string[]) => {
  const [teamSlug, siteBoundary, { longitude, latitude }] = useStore(
    (state) => [
      state.teamSlug,
      state.computePassport().data?.["proposal.site"],
      (state.computePassport().data?.["_address"] as SiteAddress) || {},
    ],
  );

  // Fetch planning constraints data for a given local authority if a geometry is available and at least one PD sourced dataset is selected in the editor modal
  const shouldFetchPlanningData =
    Boolean(latitude) &&
    Boolean(longitude) &&
    dataValues.some((val) => val !== "road.classified");

  // Get the WKT representation of the site boundary drawing or address point to pass to Planning Data
  const wktPoint = `POINT(${longitude} ${latitude})`;
  const wktPolygon: string | undefined =
    siteBoundary && stringify(siteBoundary);

  const geom = wktPolygon || wktPoint;

  const query = useQuery({
    queryKey: ["planningConstraints", teamSlug, geom, dataValues],
    queryFn: () => getTeamGISData({ teamSlug, geom, dataValues }),
    enabled: shouldFetchPlanningData,
    refetchOnWindowFocus: false,
  });

  return query;
};
