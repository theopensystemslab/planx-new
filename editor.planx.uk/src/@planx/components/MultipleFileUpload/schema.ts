import { array, mixed, object, SchemaOf, string } from "yup";

import { MoreInformation } from "../shared";
import {
  Condition,
  FileType,
  MultipleFileUpload,
  Operator,
  Rule,
} from "./model";

const moreInformationSchema: SchemaOf<MoreInformation> = object({
  howMeasured: string(),
  policyRef: string(),
  info: string(),
  notes: string(),
  definitionImg: string(),
});

const conditionalRuleSchema = string().when("condition", {
  is: (condition: Condition) =>
    [Condition.RequiredIf, Condition.RecommendedIf].includes(condition),
  then: (schema) => schema.required(),
});

const ruleSchema: SchemaOf<Rule> = object({
  condition: string()
    .equals([
      "NotRequired",
      "AlwaysRequired",
      "AlwaysRecommended",
      "RequiredIf",
      "RecommendedIf",
    ])
    .required(),
  // condition: mixed<Condition>().required().oneOf(Object.values(Condition)),
  operator: conditionalRuleSchema,
  val: conditionalRuleSchema,
  fn: conditionalRuleSchema,
});

const fileTypeSchema: SchemaOf<FileType> = object({
  key: string().required(),
  fn: string().required(),
  rule: ruleSchema,
  moreInformation: moreInformationSchema.optional(),
});

export const multipleFileUploadSchema: SchemaOf<MultipleFileUpload> = object({
  title: string().required(),
  description: string(),
  fn: string(),
  fileTypes: array().of(fileTypeSchema).required().min(1),
}).concat(moreInformationSchema);
