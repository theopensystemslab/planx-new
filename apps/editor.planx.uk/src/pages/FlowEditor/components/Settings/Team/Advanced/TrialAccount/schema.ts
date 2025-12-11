import { boolean, object, type SchemaOf } from "yup";

import type { TrialAccountFormValues } from "./types";

export const validationSchema: SchemaOf<TrialAccountFormValues> =
  object().shape({
    isTrial: boolean().required(),
  });

export const defaultValues: TrialAccountFormValues = {
  isTrial: false,
};
