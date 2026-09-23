import { boolean, object, type SchemaOf } from "yup";

import type { LocalPlanningAuthorityFormValues } from "./types";

export const validationSchema: SchemaOf<LocalPlanningAuthorityFormValues> =
  object().shape({
    isLpa: boolean().required(),
  });

export const defaultValues: LocalPlanningAuthorityFormValues = {
  isLpa: true,
};
