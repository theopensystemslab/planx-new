import type { RequestHandler } from "express";

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
}

export type ComponentGuideController = RequestHandler<
  Record<string, never>,
  ComponentGuideResponse
>;
