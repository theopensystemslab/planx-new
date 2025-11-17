import { DEFAULT_PRIVACY_NOTICE } from "pages/FlowEditor/components/Settings/ServiceSettings/FlowElements/FooterLinksAndLegalDisclaimer";
import type { TextContent } from "types";
import { boolean, object, type SchemaOf, string } from "yup";

export const validationSchema: SchemaOf<TextContent> = object({
  heading: string().min(1).required().default("Privacy notice"),
  content: string().min(1).required().default(DEFAULT_PRIVACY_NOTICE),
  show: boolean().required().default(false),
});
