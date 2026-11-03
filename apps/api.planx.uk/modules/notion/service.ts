import { NotionAPI } from "notion-client";
import type { ExtendedRecordMap } from "notion-types";

// Pages are publicly shared via notion.site, so no auth token is required
const notion = new NotionAPI();

export const getNotionPage = (pageId: string): Promise<ExtendedRecordMap> =>
  notion.getPage(pageId);
