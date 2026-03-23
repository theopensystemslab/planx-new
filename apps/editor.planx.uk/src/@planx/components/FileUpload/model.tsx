import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "@planx/components/shared";
import { richText } from "lib/yupExtensions";
import { FileWithPath } from "react-dropzone";
import { array, number, object, SchemaOf, string } from "yup";

export interface FileUpload extends BaseNodeData {
  title: string;
  fn: string;
  description?: string;
  maxFiles?: number;
}

export interface FileUploadSlot {
  file: FileWithPath;
  status: "success" | "error" | "uploading";
  progress: number;
  id: string;
  url?: string;
  cachedSlot?: Omit<FileUploadSlot, "cachedSlot">;
}

export const parseFileUpload = (
  data: Record<string, any> | undefined,
): FileUpload => ({
  definitionImg: data?.definitionImg,
  description: data?.description || "",
  fn: data?.fn || "",
  howMeasured: data?.howMeasured,
  info: data?.info,
  notes: data?.notes || "",
  policyRef: data?.policyRef,
  title: data?.title || "",
  maxFiles: data?.maxFiles,
  ...parseBaseNodeData(data),
});

export const slotsSchema = array()
  .required()
  .test({
    name: "minFileUploaded",
    message: "Upload at least one file",
    test: (slots?: Array<FileUploadSlot>) => {
      const isAtLeastOneFileUploaded = slots && slots.length > 0;
      return Boolean(isAtLeastOneFileUploaded);
    },
  })
  .test({
    name: "nonUploading",
    message: "Please wait for upload to complete",
    test: (slots?: Array<FileUploadSlot>) => {
      return Boolean(
        slots &&
        slots.length > 0 &&
        !slots.some((slot) => slot.status === "uploading"),
      );
    },
  })
  .test({
    name: "errorStatus",
    message: "Remove files which failed to upload",
    test: (slots?: Array<FileUploadSlot>) => {
      return Boolean(
        slots &&
        slots.length > 0 &&
        !slots.some((slot) => slot.status === "error"),
      );
    },
  });

export const validationSchema: SchemaOf<FileUpload> =
  baseNodeDataValidationSchema.concat(
    object({
      description: richText(),
      title: string().required(),
      fn: string().nullable().required(),
      maxFiles: number().optional(),
    }),
  );

export const fileUploadValidationSchema = ({
  required,
}: {
  required: boolean;
}) =>
  array().when([], {
    is: () => required,
    then: slotsSchema,
    otherwise: array().optional(),
  });
