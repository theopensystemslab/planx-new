import type { SchemaOf } from "yup";
import { object, string } from "yup";

import type { BaseNodeData } from "../shared";
import { baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";

export interface Note extends BaseNodeData {
  text: string;
}

export const parseContent = (data: Record<string, any> | undefined): Note => ({
  text: data?.text || "",
  ...parseBaseNodeData(data),
});

export const validationSchema: SchemaOf<Note> =
  baseNodeDataValidationSchema.concat(
    object({
      text: string().required(),
    }),
  );
