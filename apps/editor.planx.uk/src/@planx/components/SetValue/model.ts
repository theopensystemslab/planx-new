import { object, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface BaseSetValue extends BaseNodeData {
  fn: string;
}

interface SetValueWithVal extends BaseSetValue {
  val: string;
  operation: "replace" | "append" | "removeOne";
}

interface SetValueWithoutVal extends BaseSetValue {
  val?: string;
  operation: "removeAll";
}

export type SetValue = SetValueWithVal | SetValueWithoutVal;

export const parseSetValue = (
  data: Record<string, any> | undefined,
): SetValue => ({
  fn: data?.fn || "",
  val: data?.val || "",
  operation: data?.operation || "replace",
  ...parseBaseNodeData(data),
});

export const validationSchema = baseNodeDataValidationSchema.concat(
  object({
    fn: string().nullable().required(),
  }),
);
