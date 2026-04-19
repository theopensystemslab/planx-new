import {
  baseNodeDataValidationSchema,
  moreInformationSchema,
} from "@planx/components/shared";
import { richText } from "lib/yupExtensions";
import type { TestContext } from "vitest";
import {
  array,
  boolean,
  mixed,
  object,
  SchemaOf,
  string,
  ValidationError,
} from "yup";

import { Condition, Operator, Rule } from "../shared/RuleBuilder/types";
import { checkIfConditionalRule } from "../shared/RuleBuilder/utils";
import {
  FileList,
  FileType,
  FileUploadAndLabel,
  FileUploadAndLabelSlot,
} from "./model";

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
  fn: string().required("Required field"),
  rule: ruleSchema,
  moreInformation: moreInformationSchema.optional(),
});

export const fileUploadAndLabelSchema: SchemaOf<FileUploadAndLabel> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText(),
      fn: string(),
      fileTypes: array().of(fileTypeSchema).required().min(1),
      hideDropZone: boolean(),
      showDrawingNumber: boolean(),
    }),
  );

interface SlotsSchemaTestContext extends TestContext {
  fileList: FileList;
}

export const slotsSchema = array()
  .required()
  .test({
    name: "minFileUploaded",
    message: "Upload at least one file",
    test: (slots, { options: { context } }) => {
      if (!context) throw new Error("Missing context for slotsSchema");
      if (!slots) throw new Error("Missing slots for slotsSchema");

      const { fileList } = context as SlotsSchemaTestContext;
      const noFilesAreRequired = Boolean(!fileList.required.length);
      if (noFilesAreRequired) return true;

      const isAtLeastOneFileUploaded = slots.length > 0;
      return isAtLeastOneFileUploaded;
    },
  })
  .test({
    name: "nonUploading",
    message: "Please wait for upload to complete",
    test: (slots) => {
      const isAnyUploadInProgress = Boolean(
        slots?.some((slot) => slot.status === "uploading"),
      );
      return !isAnyUploadInProgress;
    },
  })
  .test({
    name: "errorStatus",
    message: "Remove files which failed to upload",
    test: (slots) => {
      const didAnyUploadFail = slots?.some((slot) => slot.status === "error");
      return !didAnyUploadFail;
    },
  })
  .test({
    name: "allFilesTagged",
    test: (slots, { createError }) => {
      if (!slots) return true;
      const errors: ValidationError[] = [];
      slots.forEach((slot) => {
        if (!slot.tags || slot.tags.length === 0) {
          errors.push(
            createError({
              path: slot.id,
              message: `File ${slot.file.name} is not labeled`,
            }),
          );
        }
      });

      return errors.length ? new ValidationError(errors) : true;
    },
  })
  .test({
    name: "allRequiredFilesUploaded",
    message: "Please upload and label all required information",
    test: (slots, context) => {
      const fileList = context.options.context?.fileList as FileList;
      if (!fileList) return true;

      if (!slots || slots.length === 0) return true;

      const assignedTags = new Set(
        slots?.flatMap((s) => (s as FileUploadAndLabelSlot).tags || []),
      );

      const isEveryRequiredTypeSatisfied = fileList.required.every((type) =>
        assignedTags.has(type.name),
      );

      return isEveryRequiredTypeSatisfied;
    },
  });

/**
 * Helper to format the combined errors for the reducer
 */
export const formatValidationErrors = (err: ValidationError) => {
  const fileLabel: Record<string, string> = {};
  let fileList: string | undefined;

  err.inner.forEach((error) => {
    if (!error.path) {
      fileList = error.message;
    } else {
      fileLabel[error.path] = error.message;
    }
  });

  return { fileLabel, fileList };
};
