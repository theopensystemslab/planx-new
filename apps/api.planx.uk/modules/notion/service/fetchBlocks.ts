import fetch from "isomorphic-fetch";

import { ServerError } from "../../../errors/serverError.js";
import {
  NOTION_API_BASE,
  NOTION_PAGE_SIZE,
  NOTION_VERSION,
} from "../constants.js";
import type { NotionBlock, NotionBlockChildrenResponse } from "../types.js";

const notionHeaders = () => ({
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  "Notion-Version": NOTION_VERSION,
});

/**
 * Fetch every child block of `blockId`, following pagination until exhausted.
 */
const listBlockChildren = async (blockId: string): Promise<NotionBlock[]> => {
  const blocks: NotionBlock[] = [];
  let cursor: string | null = null;

  do {
    const params = new URLSearchParams({
      page_size: String(NOTION_PAGE_SIZE),
      ...(cursor ? { start_cursor: cursor } : {}),
    });
    const url = `${NOTION_API_BASE}/blocks/${blockId}/children?${params}`;
    const res = await fetch(url, { headers: notionHeaders() });

    if (!res.ok) {
      const body = await res.text();
      throw new ServerError({
        message: `Notion API responded ${res.status} when listing children of ${blockId}: ${body}`,
        status: res.status === 404 ? 404 : 502,
      });
    }

    const data: NotionBlockChildrenResponse = await res.json();
    blocks.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return blocks;
};

/**
 * Recursively fetch the block tree rooted at `blockId`, attaching nested blocks
 * as `block.children` so the markdown converter can walk a single structure.
 */
export const fetchBlockTree = async (
  blockId: string,
): Promise<NotionBlock[]> => {
  const blocks = await listBlockChildren(blockId);

  await Promise.all(
    blocks.map(async (block) => {
      // Notion returns synced_block / column_list wrappers etc. with has_children;
      // recursing generically keeps the converter simple.
      if (block.has_children) {
        block.children = await fetchBlockTree(block.id);
      }
    }),
  );

  return blocks;
};
