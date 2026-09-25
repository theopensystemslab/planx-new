import { TEAM_CATEGORIES, type TeamCategory } from "lib/teamCategories";
import { mixed, object, type SchemaOf } from "yup";

import type { TeamCategoryFormValues } from "./types";

export const validationSchema: SchemaOf<TeamCategoryFormValues> =
  object().shape({
    category: mixed<TeamCategory>()
      .oneOf([...TEAM_CATEGORIES])
      .required(),
  });

export const defaultValues: TeamCategoryFormValues = {
  category: "lpa",
};
