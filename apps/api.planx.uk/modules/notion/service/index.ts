import { ServerError } from "../../../errors/serverError.js";
import { CACHE_TTL_MS, COMPONENT_GUIDE_PAGE_ID } from "../constants.js";
import type { ComponentGuideResponse } from "../types.js";
import { blocksToMarkdown } from "./blocksToMarkdown.js";
import { fetchBlockTree } from "./fetchBlocks.js";

interface CacheEntry {
  value: ComponentGuideResponse;
  expiresAt: number;
}

// Single-page endpoint, so a single-entry in-memory cache is enough. Keyed by
// page id in case the source page id is ever changed via env without a restart.
const cache = new Map<string, CacheEntry>();

/** Exposed for tests */
export const clearComponentGuideCache = () => cache.clear();

export const getComponentGuideMarkdown =
  async (): Promise<ComponentGuideResponse> => {
    if (!process.env.NOTION_API_KEY) {
      throw new ServerError({ message: "NOTION_API_KEY is not set" });
    }

    const pageId = COMPONENT_GUIDE_PAGE_ID;
    const cached = cache.get(pageId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const blocks = await fetchBlockTree(pageId);
    const value: ComponentGuideResponse = {
      markdown: blocksToMarkdown(blocks),
      fetchedAt: new Date().toISOString(),
    };

    cache.set(pageId, { value, expiresAt: Date.now() + CACHE_TTL_MS });
    return value;
  };
