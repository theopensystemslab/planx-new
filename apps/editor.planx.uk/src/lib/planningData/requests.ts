import axios from "axios";

import type {
  SearchEntityParams,
  SearchEntityResponse,
  SearchEntityResponseExcludeGeom,
} from "./types";
import { buildingSafetyLevyRatesResponseSchema } from "./types";
import { type Entity } from "./types";

const PLANNING_DATA_URL = "https://www.planning.data.gov.uk" as const;

/**
 * Query the "Search Entity" endpoint
 * Docs: https://www.planning.data.gov.uk/docs#/Search%20entity
 */
export const searchEntity = async (params: SearchEntityParams) => {
  const { data } = await axios.get<SearchEntityResponse>("/entity.geojson", {
    baseURL: PLANNING_DATA_URL,
    params: {
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
 *
 * Planning Data includes historic entities by default, needed for pre-merger LADs (eg Wycombe etc for
 * Uniform connector mappings)
 */
export const getFindPropertyData = async (
  params: Pick<SearchEntityParams, "latitude" | "longitude">,
) =>
  searchEntity({
    ...params,
    geometryRelation: "intersects",
    datasets: [
      "local-authority-district",
      "local-planning-authority",
      "region",
      "ward",
      "parish",
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

/**
 * Get all named entities (omitting geometry) in a single dataset to autosuggest data values for `property.{dataset}`
 *
 * Historic entities are included by default (period: "all")
 */
export const getEntityNames = async (dataset: string) => {
  const { data } = await axios.get<SearchEntityResponseExcludeGeom>(
    `/entity.json`,
    {
      baseURL: PLANNING_DATA_URL,
      params: {
        limit: 500,
        dataset: dataset,
        exclude_field: "geometry,point", // don't return geometry for faster, lighter response
      },
      paramsSerializer: {
        indexes: null,
      },
    },
  );

  return data.entities.map((entity) => entity.name).sort();
};

/**
 * Get Building Safety Levy rates for local authority districts
 */
export const getBuildingSafetyLevyRates = async () => {
  const { data } = await axios.get(`/entity.json`, {
    baseURL: PLANNING_DATA_URL,
    params: {
      limit: 500,
      dataset: "building-safety-levy-rate",
      period: "current", // exclude historic entities
      exclude_field: "geometry,point",
    },
  });

  return buildingSafetyLevyRatesResponseSchema.parse(data).entities;
};

/**
 * Get all possible data values for `property.constraints.planning`
 *   Includes granular `articleFour` values for applicable teams
 */
export const getPlanningConstraintsSchema = async (teamSlug?: string) => {
  const { data } = await axios.get<string[]>(`/planning-constraints-schema`, {
    baseURL: import.meta.env.VITE_APP_API_URL,
    ...(teamSlug && {
      params: {
        localAuthority: teamSlug,
      },
    }),
  });

  return data;
};
