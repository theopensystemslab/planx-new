import { TEXT_LIMITS, TextInputType } from "@planx/components/TextInput/model";
import { richText } from "lib/yupExtensions";
import { object, type SchemaOf, string } from "yup";

import type { AboutFlow } from "./types";

export const characterCountLimit = TEXT_LIMITS[TextInputType.Short];

export const validationSchema: SchemaOf<AboutFlow> = object({
  summary: string()
    .max(
      characterCountLimit,
      `Service summary must be ${characterCountLimit} characters or less`,
    )
    .required()
    .test(
      "formatting",
      "The summary must start with a capital letter and end in a full stop.",
      (value) => {
        if (!value) return true;
        const trimmed = value.trim();
        return /^[A-Z]/.test(trimmed) && trimmed.endsWith(".");
      },
    ),
  description: richText(),
  limitations: richText(),
});

export const defaultValues: AboutFlow = {
  summary: "",
  description: "",
  limitations: "",
};
