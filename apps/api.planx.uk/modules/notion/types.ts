import type { ExtendedRecordMap } from "notion-types";
import { z } from "zod";

import type { ValidatedRequestHandler } from "../../shared/middleware/validate.js";

// Notion page IDs are 32 hex characters, optionally hyphenated as a UUID
const NOTION_PAGE_ID_REGEX = /^[0-9a-f]{32}$/i;

export const getNotionPageSchema = z.object({
  params: z.object({
    pageId: z
      .string()
      .transform((id) => id.replaceAll("-", ""))
      .refine((id) => NOTION_PAGE_ID_REGEX.test(id), {
        message: "Invalid Notion page ID",
      }),
  }),
});

export type GetNotionPageController = ValidatedRequestHandler<
  typeof getNotionPageSchema,
  ExtendedRecordMap
>;
