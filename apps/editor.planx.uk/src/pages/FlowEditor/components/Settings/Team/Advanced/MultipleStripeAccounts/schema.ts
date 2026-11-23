import { boolean, object, type SchemaOf } from "yup";

import type { MultipleStripeAccountsFormValues } from "./types";

export const validationSchema: SchemaOf<MultipleStripeAccountsFormValues> =
  object().shape({
    multipleStripeAccountsEnabled: boolean().required(),
  });

export const defaultValues: MultipleStripeAccountsFormValues = {
  multipleStripeAccountsEnabled: false,
};
