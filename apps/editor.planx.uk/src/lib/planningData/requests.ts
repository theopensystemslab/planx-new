import axios from "axios";

import { type Entity, SearchEntityParams, SearchEntityResponse } from "./types";

const PLANNING_DATA_URL = "https://www.planning.data.gov.uk" as const;

/**
 * Query the "Search Entity" endpoint
 * Docs: https://www.planning.data.gov.uk/docs#/Search%20entity
 */
export const searchEntity = async (params: SearchEntityParams) => {
  const { data } = await axios.get<SearchEntityResponse>("/entity.geojson", {
    baseURL: PLANNING_DATA_URL,
    params: {
      entries: params.entries,
      longitude: params.longitude,
      latitude: params.latitude,
      geometry_relation: params.geometryRelation,
      limit: params.limit || 100,
      dataset: params.datasets,
    },
    paramsSerializer: {
      indexes: null,
    },
  });

  return data;
};

/**
 * Query the "Search Entity" endpoint with the required parameters to get data for the FindProperty component
 */
export const getFindPropertyData = async (
  params: Pick<SearchEntityParams, "latitude" | "longitude">,
) =>
  searchEntity({
    ...params,
    // includes historic for pre-merger LADs (eg Wycombe etc for Uniform connector mappings)
    entries: "all",
    geometryRelation: "intersects",
    datasets: [
      "local-authority-district",
      "local-planning-authority",
      "region",
      "ward",
      "development-corporation-boundary",
      "title-boundary",
    ],
  });

export const getEntity = async (
  entityId: string,
  format: "geojson" = "geojson",
) => {
  const { data } = await axios.get<Entity>(`/entity/${entityId}.${format}`, {
    baseURL: PLANNING_DATA_URL,
  });
  return data;
};
