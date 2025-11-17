import type { TextContent } from "types";
import { boolean, object, type SchemaOf, string } from "yup";

export const textContentValidationSchema: SchemaOf<TextContent> = object({
  heading: string().min(1).required(),
  content: string().min(1).required(),
  show: boolean().required(),
});
