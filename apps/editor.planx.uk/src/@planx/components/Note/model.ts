import type { SchemaOf} from "yup";
import { object, string } from "yup";

import type {
  BaseNodeData} from "../shared";
import {
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface Note extends BaseNodeData {
  note: string;
}

export const parseContent = (data: Record<string, any> | undefined): Note => ({
  note: data?.note || "",
  ...parseBaseNodeData(data),
});

// TODO determine if use of "required" here will interfere later with flattened graph where `note` has been stripped out?
export const validationSchema: SchemaOf<Note> =
  baseNodeDataValidationSchema.concat(
    object({
      note: string().required(),
    }),
  );
