import apiClient from "lib/api/client";

import type { ComponentGuideResponse } from "./types";

/**
 * Fetch the "How to use this component" guide, sourced from a Notion page and
 * converted to markdown server-side. See api.planx.uk `modules/notion`.
 *
 * @param pageId - optional Notion page id to read instead of the API default
 */
export const getComponentGuide = async (pageId?: string) => {
  const { data } = await apiClient.get<ComponentGuideResponse>(
    "/notion/component-guide",
    pageId ? { params: { pageId } } : undefined,
  );
  return data;
};
