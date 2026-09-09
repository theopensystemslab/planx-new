import apiClient from "lib/api/client";

import type { ComponentGuideResponse } from "./types";

/**
 * Fetch the "How to use this component" guide, sourced from a fixed Notion page
 * and converted to markdown server-side. See api.planx.uk `modules/notion`.
 */
export const getComponentGuide = async () => {
  const { data } = await apiClient.get<ComponentGuideResponse>(
    "/notion/component-guide",
  );
  return data;
};
