import { DEFAULT_PRIVACY_NOTICE } from "pages/FlowEditor/components/Settings/ServiceSettings/FlowElements/FooterLinksAndLegalDisclaimer";
import type { TextContent } from "types";
import { boolean, object, type SchemaOf, string } from "yup";

export const validationSchema: SchemaOf<TextContent> = object({
  heading: string().min(1).required(),
  content: string().min(1).required(),
  show: boolean().required(),
});

export const defaultValues: TextContent = {
  heading: "Privacy notice",
  content: DEFAULT_PRIVACY_NOTICE,
  show: false,
};
