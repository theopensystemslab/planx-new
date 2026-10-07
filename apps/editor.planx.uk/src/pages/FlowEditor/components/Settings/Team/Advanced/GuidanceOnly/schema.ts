import { boolean, object, type SchemaOf } from "yup";

import type { GuidanceOnlyFormValues } from "./types";

export const validationSchema: SchemaOf<GuidanceOnlyFormValues> =
  object().shape({
    isGuidanceOnly: boolean().required(),
  });

export const defaultValues: GuidanceOnlyFormValues = {
  isGuidanceOnly: false,
};
