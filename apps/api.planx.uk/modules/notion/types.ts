import { z } from "zod";

import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

/**
 * A deliberately narrow subset of Notion's API types — only the fields the
 * blocks-to-markdown converter reads. See https://developers.notion.com/reference/block
 */

export interface NotionRichText {
  plain_text: string;
  href: string | null;
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
}

interface RichTextContainer {
  rich_text: NotionRichText[];
}

export interface NotionBlock {
  id: string;
  type: string;
  has_children: boolean;
  /** Populated by our recursive fetch, not by the Notion API itself */
  children?: NotionBlock[];
  paragraph?: RichTextContainer;
  heading_1?: RichTextContainer;
  heading_2?: RichTextContainer;
  heading_3?: RichTextContainer;
  bulleted_list_item?: RichTextContainer;
  numbered_list_item?: RichTextContainer;
  quote?: RichTextContainer;
  toggle?: RichTextContainer;
  to_do?: RichTextContainer & { checked: boolean };
  callout?: RichTextContainer & {
    icon?: { type: string; emoji?: string } | null;
  };
  code?: RichTextContainer & { language: string };
  image?: {
    type: "external" | "file";
    external?: { url: string };
    file?: { url: string };
    caption: NotionRichText[];
  };
  // embed / video / bookmark / link_preview all expose a `url` (+ optional caption)
  embed?: { url: string; caption?: NotionRichText[] };
  video?: {
    type: "external" | "file";
    external?: { url: string };
    file?: { url: string };
    caption?: NotionRichText[];
  };
  bookmark?: { url: string; caption?: NotionRichText[] };
  link_preview?: { url: string };
  [key: string]: unknown;
}

export interface NotionBlockChildrenResponse {
  results: NotionBlock[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface ComponentGuideResponse {
  /** CommonMark rendering of the source page's block tree */
  markdown: string;
  /** ISO timestamp of when the underlying Notion fetch ran (not the cache read) */
  fetchedAt: string;
  /** The Notion page id the content was taken from (default or the `?pageId` override) */
  pageId: string;
}

// A Notion page id is 32 hex chars; accept it dashed (UUID form) or bare
export const componentGuideSchema = z.object({
  query: z.object({
    pageId: z
      .string()
      .transform((value) => value.replace(/-/g, "").toLowerCase())
      .refine((value) => /^[0-9a-f]{32}$/.test(value), {
        message: "pageId must be a 32-character Notion page id",
      })
      .optional(),
  }),
});

export type ComponentGuideController = ValidatedRequestHandler<
  typeof componentGuideSchema,
  ComponentGuideResponse
>;
