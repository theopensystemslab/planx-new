import type { ExtendedRecordMap } from "notion-types";

import apiClient from "../client";

export const getNotionPage = async (
  pageId: string,
): Promise<ExtendedRecordMap> => {
  const { data } = await apiClient.get<ExtendedRecordMap>(
    `/notion/page/${pageId}`,
  );
  return data;
};
