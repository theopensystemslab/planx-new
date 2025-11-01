/**
 * Conditions which can apply to a rule
 * Order is significant - these represent the hierarchy of these rules
 */
export enum Condition {
  AlwaysRequired = "AlwaysRequired",
  AlwaysRecommended = "AlwaysRecommended",
  RequiredIf = "RequiredIf",
  RecommendedIf = "RecommendedIf",
  NotRequired = "NotRequired",
}

export enum Operator {
  Equals = "Equals",
}

interface SimpleRuleProperties {
  val?: undefined;
  fn?: undefined;
  operator?: undefined;
}

interface ConditionalRuleProperties {
  val: string;
  fn: string;
  operator: Operator;
}

// Mapping of additional rule properties to Condition
type RuleProperties<T extends Condition> = {
  [Condition.AlwaysRequired]: SimpleRuleProperties;
  [Condition.AlwaysRecommended]: SimpleRuleProperties;
  [Condition.RequiredIf]: ConditionalRuleProperties;
  [Condition.RecommendedIf]: ConditionalRuleProperties;
  [Condition.NotRequired]: SimpleRuleProperties;
}[T];

export type ConditionalRule<T extends Condition> = {
  condition: T;
} & RuleProperties<T>;

// Union type of all possible ConditionalRule objects
export type Rule = {
  [T in Condition]: ConditionalRule<T>;
}[Condition];
