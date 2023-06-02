import { MoreInformation, parseMoreInformation } from "../shared";

export enum Condition {
  NotRequired = "NotRequired",
  AlwaysRequired = "AlwaysRequired",
  AlwaysRecommended = "AlwaysRecommended",
  RequiredIf = "RequiredIf",
  RecommendedIf = "RecommendedIf",
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
  [Condition.NotRequired]: SimpleRuleProperties;
  [Condition.AlwaysRequired]: SimpleRuleProperties;
  [Condition.AlwaysRecommended]: SimpleRuleProperties;
  [Condition.RequiredIf]: ConditionalRuleProperties;
  [Condition.RecommendedIf]: ConditionalRuleProperties;
}[T];

export type ConditionalRule<T extends Condition> = {
  condition: T;
} & RuleProperties<T>;

// Union type of all possible ConditionalRule objects
export type Rule = {
  [T in Condition]: ConditionalRule<T>;
}[Condition];

export interface FileType {
  key: string;
  fn: string;
  rule: Rule;
  moreInformation?: MoreInformation;
}

// Type canaries....
const requiredFileType: FileType = {
  key: "floorplan",
  fn: "location.data",
  rule: {
    condition: Condition.RequiredIf,
    val: "localAuthority",
    fn: "lambeth",
    operator: Operator.Equals,
  },
};

const alwaysRecommendedFileType: FileType = {
  key: "floorplan",
  fn: "location.data",
  rule: {
    condition: Condition.AlwaysRecommended,
  },
};

export interface MultipleFileUpload extends MoreInformation {
  title: string;
  description?: string;
  fn?: string;
  fileTypes: FileType[];
}

export const parseContent = (
  data: Record<string, any> | undefined
): MultipleFileUpload => ({
  title: data?.title || DEFAULT_TITLE,
  description: data?.description || "",
  fn: data?.fn || "",
  fileTypes: data?.fileTypes || [newFileType()],
  ...parseMoreInformation(data),
});

const DEFAULT_TITLE = "Upload multiple files";

export const newFileType = (): FileType => ({
  key: "",
  fn: "",
  rule: {
    condition: Condition.AlwaysRequired,
  },
});

export const checkIfConditionalRule = (condition: Condition) =>
  [Condition.RecommendedIf, Condition.RequiredIf].includes(condition);

// handleSumbit()

// interface userUploadedFile extends currentFileThing {
//   name: string
//   rule: Rule
// }

// const passport = {
//   data: {
//     floorPlan: {
//       fileUrl: "http://my-file-with-lots-of-things",
//       name: "something",
//       rule: {
//         condition: "Recommended"
//       },
//     },
//     elevationPlan: {
//       fileUrl: "http://my-file-with-lots-of-things",
//       name: "something",
//       rule: {
//         condition: "Recommended"
//       }
//     }
//   },
//   files: [
//     {
//       url: "unique http1",
//       tags: ["floorplan", "bill", "something else"]
//     },
//     {
//       url: "unique http1",
//       tags: ["elevation", "photo", "render", "floorplan"]
//     },
//   ],
// };
