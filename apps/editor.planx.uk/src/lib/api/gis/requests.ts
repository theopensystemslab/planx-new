import type { GISResponse } from "@opensystemslab/planx-core/types";

import apiClient from "../client";

export const getTeamGISData = async ({
  teamSlug,
  geom,
  dataValues,
}: {
  teamSlug: string;
  geom: string;
  dataValues: string[];
}): Promise<GISResponse & { url: string }> => {
  // Get current query parameters (eg ?analytics=false&sessionId=XXX) to determine if we should audit this response
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const { data, request } = await apiClient.get(`/gis/${teamSlug}`, {
    params: {
      geom,
      vals: dataValues.join(","),
      ...params,
    },
  });

  // Return full URL for auditing purposes
  return { ...data, url: request.responseURL };
};

export const getClassifiedRoads = async (
  usrn?: string,
): Promise<GISResponse & { url: string }> => {
  const { data, request } = await apiClient.get("/roads", {
    params: { usrn },
  });

  // Return full URL for auditing purposes
  return { ...data, url: request.responseURL };
};
