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

// Mapping of additional rule properties to Condition
type RuleProperties<T extends Condition> = {
  [Condition.NotRequired]: {};
  [Condition.AlwaysRequired]: {};
  [Condition.AlwaysRecommended]: {};
  [Condition.RequiredIf]: { val: string; fn: string; operator: Operator };
  [Condition.RecommendedIf]: { val: string; fn: string; operator: Operator };
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
    val: "value",
    fn: "fn",
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
  fileTypes: data?.fileTypes, // TODO: Parse this, inc each file's moreInfo
  ...parseMoreInformation(data),
});

const DEFAULT_TITLE = "Upload multiple files";

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
