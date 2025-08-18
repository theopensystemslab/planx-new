import { array, object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface Flow {
  id: string;
  text: string;
}

export interface Folder extends BaseNodeData {
  text?: string;
  flowId?: string;
}

export const parseFolder = (data: Record<string, any> | undefined): Folder => ({
  text: data?.text || "",
  flowId: data?.flowId || "",
  ...parseBaseNodeData(data),
});

export const validationSchema: SchemaOf<Folder> =
  baseNodeDataValidationSchema.concat(
    object({
      text: string(),
      flowId: string(),
      flows: array()
        .of(
          object({
            id: string().required(),
            text: string().required(),
          }),
        )
        .optional(),
    }),
  );
