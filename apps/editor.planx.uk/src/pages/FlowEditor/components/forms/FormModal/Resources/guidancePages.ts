import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";

/**
 * Public Notion site which hosts guidance pages
 * Links between guidance pages are resolved against this domain
 */
export const NOTION_SITE_URL = "https://opensystemslab.notion.site";

/**
 * Publicly shared Notion pages describing how to use each component
 * Key is the component type, value is the Notion page ID (from the page URL)
 * e.g. https://opensystemslab.notion.site/Section-3ac35d469ad180ce9382d6bd7acd6774
 *
 * Pages must be published to the web via Notion
 */
export const COMPONENT_GUIDANCE_PAGES: Partial<Record<TYPES, string>> = {
  [TYPES.Section]: "3ac35d469ad180ce9382d6bd7acd6774",
  [TYPES.InternalPortal]: "3ac35d469ad1804e9a15e88b51405a45",
  [TYPES.ExternalPortal]: "3ac35d469ad18068ac6fe81b676a6a51",
  [TYPES.Question]: "3ac35d469ad1806e877fea814874c8c5",
  [TYPES.ResponsiveQuestion]: "3ac35d469ad1806894d3d2f5a0349216",
  [TYPES.Checklist]: "3ac35d469ad180ae9ca4eed87cd63a95",
  [TYPES.ResponsiveChecklist]: "3ac35d469ad18031a203f8a64bc92f32",
  [TYPES.NextSteps]: "3ac35d469ad180608edecbcdb82e91cf",
  [TYPES.TextInput]: "3b235d469ad180afa9a6c0c12e0364fa",
  [TYPES.NumberInput]: "3ac35d469ad1808989eecd8bc63ef90d",
  [TYPES.DateInput]: "3ac35d469ad180b6b4c0e01cd8425abb",
  [TYPES.AddressInput]: "3ac35d469ad180d284e1cf3d0c2646cb",
  [TYPES.ContactInput]: "3ac35d469ad18007b89fe0e82eef980c",
  [TYPES.List]: "3ac35d469ad180be9e17d965442d29d6",
  [TYPES.Page]: "3ac35d469ad180f7a0aae2b629a0e0b8",
  [TYPES.Feedback]: "3ac35d469ad180aebe57cb938a90437e",
  [TYPES.FileUpload]: "3ac35d469ad180799e8dc87358e2a8f6",
  [TYPES.FileUploadAndLabel]: "3ac35d469ad1800b9361dab796a98785",
  [TYPES.Content]: "3ac35d469ad180ab970ff548bffd28c0",
  [TYPES.Notice]: "3ac35d469ad180f593efdd0f11355176",
  [TYPES.TaskList]: "3ac35d469ad1804e94f9e05381ecb1c1",
  [TYPES.Review]: "3ac35d469ad1804ea05efa79537a3f9d",
  [TYPES.Result]: "3ac35d469ad180778326c2de077957d0",
  [TYPES.Confirmation]: "3ac35d469ad180608a6ed9e7672ae76b",
  [TYPES.FindProperty]: "3ac35d469ad1800183b2f59125b63642",
  [TYPES.PropertyInformation]: "3ac35d469ad1801694b2c1b50913ec5a",
  [TYPES.DrawBoundary]: "3ac35d469ad18040b521c1cf04f2919a",
  [TYPES.PlanningConstraints]: "3ac35d469ad180a48de2d49953aaf666",
  [TYPES.MapAndLabel]: "3ac35d469ad18037b122d8ea01349079",
  [TYPES.Filter]: "3ac35d469ad180dd8089c0d952f18157",
  [TYPES.SetValue]: "3ac35d469ad1804884d2f9ed1fb10875",
  [TYPES.Calculate]: "3ac35d469ad1805ba582f92764e434e9",
  [TYPES.SetFee]: "3ac35d469ad180d09183e9dc324f184e",
  [TYPES.Pay]: "3ac35d469ad18014860de454c8f221df",
  [TYPES.Send]: "3ac35d469ad180d08acad80f48c61c78",
};
