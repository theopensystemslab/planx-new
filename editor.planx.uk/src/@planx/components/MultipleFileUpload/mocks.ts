import { Condition, FileType, Operator, Rule } from "./model";

const mockAlwaysRequiredRule: Rule = {
  condition: Condition.AlwaysRequired,
};

const mockAlwaysRecommendedRule: Rule = {
  condition: Condition.AlwaysRecommended,
};

const mockRequiredIfRule: Rule = {
  condition: Condition.RequiredIf,
  val: "testVal",
  fn: "testFn",
  operator: Operator.Equals,
};

const mockRecommendedIfRule: Rule = {
  condition: Condition.RecommendedIf,
  val: "testVal",
  fn: "testFn",
  operator: Operator.Equals,
};

const mockNotRequiredRule: Rule = {
  condition: Condition.NotRequired,
};

export const mockRules: Record<keyof typeof Condition, Rule> = {
  [Condition.AlwaysRequired]: mockAlwaysRequiredRule,
  [Condition.AlwaysRecommended]: mockAlwaysRecommendedRule,
  [Condition.RequiredIf]: mockRequiredIfRule,
  [Condition.RecommendedIf]: mockRecommendedIfRule,
  [Condition.NotRequired]: mockNotRequiredRule,
};

const mockAlwaysRequiredFileType: FileType = {
  key: "testKey",
  fn: "testFn",
  rule: mockRules.AlwaysRequired,
};

const mockAlwaysRecommendedFileType: FileType = {
  key: "testKey",
  fn: "testFn",
  rule: mockRules.AlwaysRecommended,
};

const mockRequiredIfFileType: FileType = {
  key: "testKey",
  fn: "testFn",
  rule: mockRules.RequiredIf,
};

const mockRecommendedIfFileType: FileType = {
  key: "testKey",
  fn: "testFn",
  rule: mockRules.RecommendedIf,
};

const mockNotRequiredFileType: FileType = {
  key: "testKey",
  fn: "testFn",
  rule: mockRules.NotRequired,
};

export const mockFileTypes: Record<keyof typeof Condition, FileType> = {
  [Condition.AlwaysRequired]: mockAlwaysRequiredFileType,
  [Condition.AlwaysRecommended]: mockAlwaysRecommendedFileType,
  [Condition.RequiredIf]: mockRequiredIfFileType,
  [Condition.RecommendedIf]: mockRecommendedIfFileType,
  [Condition.NotRequired]: mockNotRequiredFileType,
};
