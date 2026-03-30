import { boolean, object, type SchemaOf } from "yup";

import { TeamConstraintsFormValues } from "./types";

export const validationSchema: SchemaOf<TeamConstraintsFormValues> = 
  object().shape({
    hasPlanningData: boolean().required(),
  });

export const defaultValues: TeamConstraintsFormValues = {
  hasPlanningData: false,
};
