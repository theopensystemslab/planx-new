import type { Success, LocalPlanningAuthorityFeature } from "./types.js";

export const findLpa = async (lon: number, lat: number): Promise<Success> => {
  const params: Record<string, string> = {
    dataset: "local-planning-authority",
    geometry: `POINT(${lon} ${lat})`,
    geometry_relation: "intersects",
    exclude_field: "geometry",
  };

  // call Planning Data API's entity endpoint
  // https://www.planning.data.gov.uk/docs
  const url = `https://www.planning.data.gov.uk/entity.json?${new URLSearchParams(
    params,
  ).toString()}`;

  console.log(url);

  const entities: LocalPlanningAuthorityFeature[] = await fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (!data.entities?.length) {
        return [];
      }

      return data.entities;
    });

  const baseResponse = {
    sourceRequest: url.split("dataset=")[0],
  };

  return {
    ...baseResponse,
    entities: entities,
  };
};
