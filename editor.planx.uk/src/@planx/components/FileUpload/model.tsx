import {
  BaseNodeData,
  baseNodeDataValidationSchema,
} from "@planx/components/shared";
import { richText } from "lib/yupExtensions";
import { Store } from "pages/FlowEditor/lib/store";
import type { HandleSubmit } from "pages/Preview/Node";
import { FileWithPath } from "react-dropzone";
import { array, object } from "yup";

export interface FileUpload extends BaseNodeData {
  id?: string;
  title?: string;
  fn: string;
  description?: string;
  handleSubmit: HandleSubmit;
  previouslySubmittedData?: Store.UserData;
}

export interface FileUploadSlot {
  file: FileWithPath;
  status: "success" | "error" | "uploading";
  progress: number;
  id: string;
  url?: string;
  cachedSlot?: Omit<FileUploadSlot, "cachedSlot">;
}

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

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    description: richText(),
  }),
);
