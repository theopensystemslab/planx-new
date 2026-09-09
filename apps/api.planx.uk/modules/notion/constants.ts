export const NOTION_API_BASE = "https://api.notion.com/v1";

// Notion requires an explicit, pinned API version on every request
// https://developers.notion.com/reference/versioning
export const NOTION_VERSION = "2022-06-28";

/**
 * The Notion page whose child blocks power the "How to use this component" modal tab.
 * Fixed server-side (rather than accepted as a request param) so this endpoint can't
 * be used to proxy arbitrary Notion pages via our integration token.
 * Override with NOTION_COMPONENT_GUIDE_PAGE_ID if the source page moves.
 */
export const COMPONENT_GUIDE_PAGE_ID =
  process.env.NOTION_COMPONENT_GUIDE_PAGE_ID ||
  "3d6a3c448ac280baa77bd6dc264906b8";

// Notion-hosted image URLs are signed and expire after ~1 hour, so keep this
// comfortably below that. Also keeps us well within Notion's rate limits.
export const CACHE_TTL_MS = 10 * 60 * 1000;

// Max children returned per Notion API page (their hard limit is 100)
export const NOTION_PAGE_SIZE = 100;
