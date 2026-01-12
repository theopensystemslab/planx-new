import {
  TextInputType,
  textInputValidationSchema,
} from "@planx/components/TextInput/model";
import { object, string } from "yup";

import type { BreadcrumbData, TaskAction } from "../types";
import type { FormValues, Props } from "./types";

export const getAction = (values: FormValues): TaskAction => {
  if (values.status === "idle")
    throw Error(
      "Unable to create EnhancedTextInput breadcrumb while in 'idle' status",
    );

  const { original, userInput, enhanced } = values;

  if (userInput === original) return "retainedOriginal";
  if (userInput === enhanced) return "acceptedEnhanced";
  return "hybrid";
};

export const makeBreadcrumb = (
  fn: string,
  values: FormValues,
): BreadcrumbData => {
  if (values.status === "idle")
    throw Error(
      "Unable to create EnhancedTextInput breadcrumb while in 'idle' status",
    );

  const { userInput, original } = values;

  const enhancement =
    values.status === "success"
      ? { original, enhanced: values.enhanced }
      : { original, error: values.error };

  return {
    [fn]: userInput,
    [`${fn}.action`]: getAction(values),
    // TODO: Ensure we deep merge this
    _enhancements: {
      [fn]: enhancement,
    },
  } as BreadcrumbData;
};

export const getValidationSchema = (props: Props) =>
  object({
    status: string().oneOf(["idle", "success", "error"]).required(),
    userInput: textInputValidationSchema({
      data: { ...props, type: TextInputType.Long },
      required: true,
    }),
    original: string().when("status", {
      is: (status: string) => status === "success" || status === "error",
      then: (schema) => schema.required("Original text is missing"),
      otherwise: (schema) => schema.strip(),
    }),
    enhanced: string()
      .nullable()
      .when("status", {
        is: "success",
        then: (schema) => schema.required("Enhanced text is missing"),
        otherwise: (schema) => schema.nullable().defined(),
      }),
    error: string()
      .nullable()
      .when("status", {
        is: "error",
        then: (schema) => schema.required("Error message is missing"),
        otherwise: (schema) => schema.nullable().defined(),
      }),
  });
