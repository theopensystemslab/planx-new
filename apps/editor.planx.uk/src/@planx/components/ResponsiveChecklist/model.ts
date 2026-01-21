import { array, object, string } from "yup";

import { ConditionalOption, optionValidationSchema } from "../Option/model";
import {
  BaseChecklist,
  baseChecklistValidationSchema,
  FlatOptions,
  GroupedOptions,
  parseBaseChecklist,
} from "../shared/BaseChecklist/model";
import { Condition, Rule } from "../shared/RuleBuilder/types";

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
  | FlatResponsiveChecklist
  | GroupedResponsiveChecklist;

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

export const validationSchema = baseChecklistValidationSchema.concat(
  object({
    groupedOptions: array(
      object({
        title: string().required("Section title is a required field").trim(),
        children: array(optionValidationSchema).required(),
      }).required(),
    ).optional(),
    options: array(optionValidationSchema).optional(),
  }),
);
