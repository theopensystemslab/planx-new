import { ServerError } from "../../../errors/serverError.js";
import { CACHE_TTL_MS, COMPONENT_GUIDE_PAGE_ID } from "../constants.js";
import type { ComponentGuideResponse } from "../types.js";
import { blocksToMarkdown } from "./blocksToMarkdown.js";
import { fetchBlockTree } from "./fetchBlocks.js";

interface CacheEntry {
  value: ComponentGuideResponse;
  expiresAt: number;
}

// Cache is keyed by page id, so overriding the page via `?pageId` gets its own
// entry rather than clobbering the default page's cached content.
const cache = new Map<string, CacheEntry>();

/** Exposed for tests */
export const clearComponentGuideCache = () => cache.clear();

export const getComponentGuideMarkdown = async (
  pageId: string = COMPONENT_GUIDE_PAGE_ID,
): Promise<ComponentGuideResponse> => {
  if (!process.env.NOTION_API_KEY) {
    throw new ServerError({ message: "NOTION_API_KEY is not set" });
  }

  const cached = cache.get(pageId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const blocks = await fetchBlockTree(pageId);
  const value: ComponentGuideResponse = {
    markdown: blocksToMarkdown(blocks),
    fetchedAt: new Date().toISOString(),
    pageId,
  };

  cache.set(pageId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
};
