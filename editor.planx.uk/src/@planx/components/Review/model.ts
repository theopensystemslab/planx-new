import { richText } from "lib/yupExtensions";
import { object, SchemaOf, string } from "yup";

import { BaseNodeData, baseNodeDataValidationSchema } from "../shared";

export interface Review extends BaseNodeData {
  title: string;
  description?: string;
  disclaimer?: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): Review => ({
  title: data?.title || "Check your answers before sending your application",
  description: data?.description || "",
  disclaimer: data?.disclaimer || DEFAULT_REVIEW_DISCLAIMER,
  notes: data?.notes || "",
});

export const DEFAULT_REVIEW_DISCLAIMER =
  "<p>Changing this answer means you will need to confirm any other answers after it. This is because: </p><ul><li>a different answer might mean the service asks new questions</li><li>your planning officer needs the right information to assess your application</li></ul>";

export const validationSchema: SchemaOf<Review> = baseNodeDataValidationSchema.concat(
  object({
    title: string().required(),
    description: richText(),
    disclaimer: richText(),
  })
);