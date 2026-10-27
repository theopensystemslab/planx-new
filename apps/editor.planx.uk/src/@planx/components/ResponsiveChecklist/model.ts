import type { TestConfig } from "yup";
import { array, object, string } from "yup";

import type { ConditionalOption } from "../Option/model";
import { optionValidationSchema } from "../Option/model";
import type {
  BaseChecklist,
  FlatOptions,
  GroupedOptions,
} from "../shared/BaseChecklist/model";
import {
  baseChecklistValidationSchema,
  parseBaseChecklist,
} from "../shared/BaseChecklist/model";
import { hasUniqueOptions, uniqueOptionsTest } from "../shared/helpers";
import type { Rule } from "../shared/RuleBuilder/types";
import { Condition } from "../shared/RuleBuilder/types";

export type ResponsiveChecklist = BaseChecklist;

export type FlatResponsiveChecklist = ResponsiveChecklist &
  FlatOptions<ConditionalOption>;
export type GroupedResponsiveChecklist = ResponsiveChecklist &
  GroupedOptions<ConditionalOption>;

/**
 * Public and Editor representation of a ResponsiveChecklist
 * Contains options derived from child Answer nodes
 */
export type ResponsiveChecklistWithOptions =
  FlatResponsiveChecklist | GroupedResponsiveChecklist;

export const parseResponsiveChecklist = (
  data: Record<string, any> | undefined,
): ResponsiveChecklistWithOptions => ({
  options: data?.options || undefined,
  groupedOptions: data?.groupedOptions || undefined,
  ...parseBaseChecklist(data),
});

export const DEFAULT_RULE: Rule = {
  condition: Condition.AlwaysRequired,
};

const uniqueOptionsWithinGroupsTest: TestConfig<ResponsiveChecklistWithOptions> =
  {
    name: "uniqueOptionsWithinGroups",
    test: function ({ groupedOptions }) {
      if (!groupedOptions) return true;

      for (const group of groupedOptions) {
        if (!group.children) continue;

        const allUnique = hasUniqueOptions(group.children);

        if (!allUnique) {
          return this.createError({
            path: "options",
            message: "Options within a single group must have unique labels",
          });
        }
      }

      return true;
    },
  };

export const validationSchema = baseChecklistValidationSchema.concat(
  object({
    groupedOptions: array(
      object({
        title: string().required("Section title is a required field").trim(),
        children: array(optionValidationSchema).required(),
      })
        .required()
        .test(uniqueOptionsWithinGroupsTest as TestConfig<unknown>),
    ).optional(),
    options: array(optionValidationSchema)
      .optional()
      .test(uniqueOptionsTest as TestConfig<unknown>),
  }),
);
