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

export interface InternalPortal extends BaseNodeData {
  text?: string;
  flowId?: string;
}

export const parseInternalPortal = (
  data: Record<string, any> | undefined,
): InternalPortal => ({
  text: data?.text || "",
  flowId: data?.flowId || "",
  ...parseBaseNodeData(data),
});

export const validationSchema: SchemaOf<InternalPortal> =
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
