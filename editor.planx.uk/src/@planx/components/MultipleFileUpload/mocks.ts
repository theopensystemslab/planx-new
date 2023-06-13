import { Condition, FileList, FileType, Operator, Rule } from "./model";

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

export const mockFileList = {
  required: [
    {
      fn: "requiredFileFn",
      name: "firstFile",
      rule: {
        condition: "AlwaysRequired",
      },
      slots: [
        {
          file: {
            path: "PXL_20230511_093922923.jpg",
          },
          status: "success",
          progress: 1,
          id: "EFGI1yU8s5s_cSBxnnYau",
          url: "http://localhost:7002/file/private/jjpmkz8g/PXL_20230511_093922923.jpg",
        },
      ],
    },
  ],
  recommended: [
    {
      fn: "recommendedFileFn",
      name: "secondFile",
      rule: {
        condition: "AlwaysRecommended",
      },
      slots: [
        {
          file: {
            path: "PXL_20230507_150205350~2.jpg",
          },
          status: "success",
          progress: 1,
          id: "ZrGNE4siV36zvA7u1QZQD",
          url: "http://localhost:7002/file/private/82wo7bev/PXL_20230507_150205350~2.jpg",
        },
      ],
    },
  ],
  optional: [
    {
      fn: "optionalFileFn",
      name: "thirdFile",
      rule: {
        condition: "NotRequired",
      },
      slots: [
        {
          file: {
            path: "PXL_20230511_093922923.jpg",
          },
          status: "success",
          progress: 1,
          id: "6bZBneLnY-L6qiqOblu8t",
          url: "http://localhost:7002/file/private/truap5az/PXL_20230511_093922923.jpg",
        },
      ],
    },
  ],
} as FileList;
