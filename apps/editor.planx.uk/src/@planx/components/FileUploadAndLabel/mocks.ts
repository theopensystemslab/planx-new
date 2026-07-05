import type { Rule } from "../shared/RuleBuilder/types";
import { Condition, Operator } from "../shared/RuleBuilder/types";
import type { FileList, FileType } from "./model";

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
  name: "testKey",
  fn: "testFn",
  rule: mockRules.AlwaysRequired,
};

const mockAlwaysRecommendedFileType: FileType = {
  name: "testKey",
  fn: "testFn",
  rule: mockRules.AlwaysRecommended,
};

const mockRequiredIfFileType: FileType = {
  name: "testKey",
  fn: "testFn",
  rule: mockRules.RequiredIf,
};

const mockRecommendedIfFileType: FileType = {
  name: "testKey",
  fn: "testFn",
  rule: mockRules.RecommendedIf,
};

const mockNotRequiredFileType: FileType = {
  name: "testKey",
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

export const mockFileTypesUniqueKeys: FileType[] = [
  {
    fn: "roofPlan",
    name: "Roof plan",
    rule: {
      condition: Condition.AlwaysRequired,
    },
  },
  {
    fn: "heritage",
    name: "Heritage statement",
    rule: {
      condition: Condition.AlwaysRecommended,
    },
    moreInformation: {
      info: "<p>Help text</p>",
    },
  },
  {
    fn: "utilityBill",
    name: "Utility bill",
    rule: {
      condition: Condition.NotRequired,
    },
  },
];

export const mockFileList: FileList = {
  required: [
    {
      fn: "requiredFileFn",
      name: "firstFile",
      rule: {
        condition: Condition.AlwaysRequired,
      },
    },
  ],
  recommended: [
    {
      fn: "recommendedFileFn",
      name: "secondFile",
      rule: {
        condition: Condition.AlwaysRecommended,
      },
    },
  ],
  optional: [
    {
      fn: "optionalFileFn",
      name: "thirdFile",
      rule: {
        condition: Condition.NotRequired,
      },
    },
  ],
};
