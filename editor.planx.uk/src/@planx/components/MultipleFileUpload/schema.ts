import { array, mixed, object, SchemaOf, string } from "yup";

import { FileUploadSlot } from "../FileUpload/Public";
import { MoreInformation } from "../shared";
import {
  checkIfConditionalRule,
  Condition,
  FileType,
  MultipleFileUpload,
  Operator,
  Rule,
  UserFile,
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
  condition: mixed().oneOf(Object.values(Condition)).required(),
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

export const slotsSchema = array()
  .min(1, "Upload at least one file")
  .required()
  .test({
    name: "nonUploading",
    message: "Please wait for upload to complete",
    test: (slots?: Array<FileUploadSlot>) =>
      !slots?.some((slot) => slot.status === "uploading"),
  });

export const fileListSchema = object({
  required: array().test({
    name: "allRequiredFilesUploaded",
    message: "Please upload all required files",
    test: (userFile?: UserFile[]) =>
      !userFile?.every((userFile) => userFile?.slot),
  }),
});
