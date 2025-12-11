import type { GeoJsonObject } from "geojson";

export interface BoundaryFormValues {
  boundaryUrl: string;
  boundaryBBox?: GeoJsonObject;
}

export interface GetTeamSettingsData {
  teams: {
    id: string;
    settings: {
      boundaryUrl: string;
      boundaryBBox?: GeoJsonObject;
    };
  }[];
}

export interface UpdateTeamSettingsVariables {
  teamId: number;
  settings: {
    boundary_url: string;
    boundary_bbox?: GeoJsonObject;
  };
}
