import { boolean, object, type SchemaOf } from "yup";

import type { VisibilityFormValues } from "./types";

export const validationSchema: SchemaOf<VisibilityFormValues> = object({
  canCreateFromCopy: boolean().required(),
});

export const defaultValues: VisibilityFormValues = {
  canCreateFromCopy: false,
};
