import {
  array,
  boolean,
  mixed,
  object,
  SchemaOf,
  string,
  TestContext,
} from "yup";

import { FileUploadSlot } from "../FileUpload/Public";
import { MoreInformation } from "../shared";
import {
  checkIfConditionalRule,
  Condition,
  FileList,
  FileType,
  FileUploadAndLabel,
  getTagsForSlot,
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
  name: string().required(),
  fn: string().required(),
  rule: ruleSchema,
  moreInformation: moreInformationSchema.optional(),
});

export const fileUploadAndLabelSchema: SchemaOf<FileUploadAndLabel> = object({
  title: string().required(),
  description: string(),
  fn: string(),
  fileTypes: array().of(fileTypeSchema).required().min(1),
  hideDropZone: boolean(),
}).concat(moreInformationSchema);

export const slotsSchema = array()
  .min(1, "Upload at least one file")
  .required()
  .test({
    name: "nonUploading",
    message: "Please wait for upload to complete",
    test: (slots?: Array<FileUploadSlot>) => {
      const isEveryUploadComplete = Boolean(
        slots?.every((slot) => slot.status === "success"),
      );
      return isEveryUploadComplete;
    },
  });

interface FileListSchemaTextContext extends TestContext {
  slots: FileUploadSlot[];
}

export const fileListSchema = object({
  required: array().test({
    name: "allRequiredFilesUploaded",
    message: "Please upload and tag all required files",
    test: (userFile?: UserFile[]) => {
      const isEverySlotFilled = Boolean(
        userFile?.every(
          (userFile) => userFile?.slots && userFile.slots.length > 0,
        ),
      );
      return isEverySlotFilled;
    },
  }),
}).test({
  name: "allFilesTagged",
  message: "Please tag all files",
  test: (fileList, { options: { context } }) => {
    if (!context) throw new Error("Missing context for fileListSchema");
    const { slots } = context as FileListSchemaTextContext;
    const isEveryFileTagged = Boolean(
      slots?.every(
        (slot) => getTagsForSlot(slot.id, fileList as FileList).length,
      ),
    );
    return isEveryFileTagged;
  },
});
