import { boolean, mixed, object, type SchemaOf, string } from "yup";

import { LPSListingFormValues } from "./types";

export const validationSchema: SchemaOf<LPSListingFormValues> = object({
  isListedOnLPS: boolean()
    .required()
    .test(
      "requires-summary",
      'Service summary required - please set via the "About this flow" tab',
      function (value) {
        const { summary } = this.parent;
        if (value && !summary) {
          return false;
        }
        return true;
      },
    ),
  summary: string().nullable(),
  category: mixed()
    .oneOf(["guidance", "notify", "apply"])
    .required("Category is a required field"),
});

export const defaultValues: LPSListingFormValues = {
  isListedOnLPS: false,
  summary: null,
  category: null,
};
