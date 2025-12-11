import apiClient from "lib/api/client";

import type { EnhanceResponse } from "./types";

export const enhanceProjectDescription = async (original: string) => {
  const { data } = await apiClient.post<EnhanceResponse>(
    "/ai/project-description/enhance",
    { original },
  );
  return data;
};
