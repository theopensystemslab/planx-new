import { Store } from "pages/FlowEditor/lib/store";

import { Condition, Operator, Rule } from "./types";

export const isRuleMet = (passport: Store.Passport, rule: Rule): boolean => {
  // TODO: Tests
  if (rule.condition === Condition.AlwaysRequired) return true;
  if (rule.condition === Condition.AlwaysRecommended) return true;
  if (rule.condition === Condition.NotRequired) return true;

  const passportVal = passport.data?.[rule.fn];
  if (!passportVal) return false;

  const isExactMatch = passportVal === rule.val;
  const isArray = Array.isArray(passportVal);
  const isExactMatchInArray = isArray && passportVal.includes(rule.val);
  const re = new RegExp(`^${rule.val}(\\..+| $)`);
  const isGranularMatchInArray =
    isArray && passportVal.some((value: string) => re.test(value));

  return isExactMatch || isExactMatchInArray || isGranularMatchInArray;
};

export const checkIfConditionalRule = (condition: Condition) =>
  [Condition.RecommendedIf, Condition.RequiredIf].includes(condition);

export const formatRule = (
  newCondition: Condition,
  { fn, val }: Rule,
): Rule => {
  const isConditionalRule = checkIfConditionalRule(newCondition);

  // Drop fields which are only required for ConditionalRules
  const updatedRule = {
    condition: newCondition,
    operator: isConditionalRule ? Operator.Equals : undefined,
    fn: isConditionalRule ? fn : undefined,
    val: isConditionalRule ? val : undefined,
  } as Rule;

  return updatedRule;
};
