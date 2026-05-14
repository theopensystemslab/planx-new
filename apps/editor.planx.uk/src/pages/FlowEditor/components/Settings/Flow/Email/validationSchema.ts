import { object, type SchemaOf, string } from "yup";

import type { FormValues } from "./types";

export const validationSchema: SchemaOf<FormValues> = object({
  emailTemplate: string()
    .oneOf(["application", "general"] as const)
    .required() as SchemaOf<FormValues["emailTemplate"]>,
});

export const defaultValues: FormValues = {
  emailTemplate: "application",
};
