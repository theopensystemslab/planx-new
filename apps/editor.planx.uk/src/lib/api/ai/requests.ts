import apiClient from "lib/api/client";

import type { EnhanceRequest, EnhanceResponse } from "./types";

export const enhanceProjectDescription = async (request: EnhanceRequest) => {
  const { data } = await apiClient.post<EnhanceResponse>(
    "/ai/project-description/enhance",
    request,
  );
  return data;
};
