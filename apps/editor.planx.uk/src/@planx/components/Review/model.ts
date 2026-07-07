import { richText } from "lib/yupExtensions";
import type { SchemaOf } from "yup";
import { object, string } from "yup";

import type { BaseNodeData } from "../shared";
import { baseNodeDataValidationSchema } from "../shared";

export interface Review extends BaseNodeData {
  title: string;
  description?: string;
  disclaimer?: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): Review => ({
  title: data?.title || "Check your answers before sending your form",
  description: data?.description || "",
  disclaimer: data?.disclaimer || DEFAULT_REVIEW_DISCLAIMER,
  notes: data?.notes || "",
});

export const DEFAULT_REVIEW_DISCLAIMER =
  "<p>Changing this answer means you will need to confirm any other answers after it. This is because a different answer might mean we need to ask different questions";

export const validationSchema: SchemaOf<Review> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText(),
      disclaimer: richText(),
    }),
  );
