import { richText } from "lib/yupExtensions";
import { lazy, mixed, object, type SchemaOf, string } from "yup";

import { baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";
import {
  type BaseEnhancedTextInput,
  type BreadcrumbData,
  type EnhancedTextInput,
  type EnhancedTextInputForTask,
  type Task,
  type TaskDefaults,
} from "./types";

const taskDefaults: TaskDefaults = {
  projectDescription: {
    abc: "",
  },
};

export const parseEnhancedTextInput = (data: Partial<EnhancedTextInput> | undefined): EnhancedTextInput => {
  const task = data?.task || "projectDescription";

  return {
    task,
    title: data?.title || "",
    description: data?.description,
    fn: data?.fn || "",
    ...parseBaseNodeData(data),
    ...taskDefaults[task],
    ...(data || {}),
  } as EnhancedTextInput;
};

const baseEnhancedTextInputSchema: SchemaOf<BaseEnhancedTextInput> =
  baseNodeDataValidationSchema.concat(
    object({
      fn: string(),
      title: string().required(),
      description: richText(),
    }),
  );

export const taskSchemas = {
  projectDescription: baseEnhancedTextInputSchema.concat(
    object({
      task: mixed()
        .oneOf(["projectDescription"] as const)
        .required(),
      abc: string().optional(),
    }),
  ),
} satisfies Record<Task, SchemaOf<EnhancedTextInputForTask<Task>>>;

export const validationSchema = lazy(
  (breadcrumbData: BreadcrumbData) => taskSchemas[breadcrumbData.task],
);

export const TASKS: Record<Task, { label: string; description: string }> = {
  projectDescription: {
    label: "Project description",
    description: "Lorem ispum....",
  },
};