import { GISResponse } from "@opensystemslab/planx-core/types";

import apiClient from "../client";
import type { GISResponseWithAudit } from "./types";

export const getTeamGISData = async ({
  teamSlug,
  geom,
  dataValues,
}: {
  teamSlug: string;
  geom: string;
  dataValues: string[];
}): Promise<GISResponseWithAudit> => {
  // Get current query parameters (eg ?analytics=false&sessionId=XXX) to determine if we should audit this response
  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());

  const { data, request } = await apiClient.get<GISResponse>(
    `/gis/${teamSlug}`,
    {
      params: {
        geom,
        vals: dataValues.join(","),
        ...params,
      },
    },
  );

  // Return full URL for auditing purposes
  return { ...data, planxRequest: request.responseURL };
};

export const getClassifiedRoads = async (
  usrn?: string,
): Promise<GISResponseWithAudit> => {
  const { data, request } = await apiClient.get<GISResponse>("/roads", {
    params: { usrn },
  });

  // Return full URL for auditing purposes
  return { ...data, planxRequest: request.responseURL };
};
