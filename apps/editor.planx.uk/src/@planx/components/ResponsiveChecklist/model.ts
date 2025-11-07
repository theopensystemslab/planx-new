import { ConditionalOption } from "../Option/model";
import {
  BaseChecklist,
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
  options: data?.options || [],
  ...parseBaseChecklist(data),
});

export const DEFAULT_RULE: Rule = {
  condition: Condition.AlwaysRequired,
};
