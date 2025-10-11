import { TEXT_LIMITS, TextInputType } from "@planx/components/TextInput/model";
import { richText } from "lib/yupExtensions";
import { object, SchemaOf, string } from "yup";

import { ReadMePageForm } from "./types";

export const characterCountLimit = TEXT_LIMITS[TextInputType.Short];

export const validationSchema: SchemaOf<ReadMePageForm> = object({
  serviceSummary: string()
    .max(
      characterCountLimit,
      `Service description must be ${characterCountLimit} characters or less`,
    )
    .required(),
  serviceDescription: richText(),
  serviceLimitations: richText(),
});
