import { array, mixed, object, SchemaOf, string } from "yup";

import { MoreInformation } from "../shared";
import {
  checkIfConditionalRule,
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

const valFnSchema = mixed().when("condition", {
  is: checkIfConditionalRule,
  then: (schema) => schema.required(),
  otherwise: (schema) => schema.equals([undefined]),
});

const operatorSchema = mixed().when("condition", {
  is: checkIfConditionalRule,
  then: (schema) => schema.equals([Operator.Equals]).required(),
  otherwise: (schema) => schema.equals([undefined]),
});

export const ruleSchema: SchemaOf<Rule> = object({
  condition: string()
    .equals([
      "AlwaysRequired",
      "AlwaysRecommended",
      "RequiredIf",
      "RecommendedIf",
      "NotRequired",
    ])
    .required(),
  operator: operatorSchema,
  val: valFnSchema,
  fn: valFnSchema,
});

export const fileTypeSchema: SchemaOf<FileType> = object({
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
