import { object, type SchemaOf, string } from "yup";

import type { ReferenceCodeFormValues } from "./types";

export const validationSchema: SchemaOf<ReferenceCodeFormValues> =
  object().shape({
    referenceCode: string()
      .min(3, "Code must be at least 3 characters long")
      .max(5, "Code cannot exceed 5 characters long")
      .required("Enter a reference code"),
  });

export const defaultValues: ReferenceCodeFormValues = {
  referenceCode: "",
};
