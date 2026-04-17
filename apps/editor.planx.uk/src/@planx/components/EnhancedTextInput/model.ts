import { richText } from "lib/yupExtensions";
import { lazy, mixed, object, type SchemaOf, string } from "yup";

import { baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";
import {
  type BaseEnhancedTextInput,
  type EnhancedTextInput,
  type EnhancedTextInputForTask,
  type Task,
  type TaskDefaults,
} from "./types";

export const taskDefaults: TaskDefaults = {
  projectDescription: {
    fn: "proposal.description",
    revisionTitle: "We suggest revising your project description",
    revisionDescription:
      "<p>The suggested description uses planning terminology that planning officers expect, reducing the chance of a delay to your application.</p><p>You will be able to modify either of the selected descriptions at the next step.</p>",
  },
};

const initialScreenDefaults: Record<
  Task,
  { title: string; description: string }
> = {
  projectDescription: {
    title: "Describe the project",
    description:
      "<p>Write a brief description of the changes using two sentences or fewer.</p><p>Your description will be checked for likelihood of validity using an AI model, and you'll have the opportunity to review and modify any changes.</p>",
  },
};

export const parseEnhancedTextInput = (
  data: Partial<EnhancedTextInput> | undefined,
): EnhancedTextInput => {
  const task = data?.task || "projectDescription";

  return {
    task,
    title: initialScreenDefaults[task].title,
    description: initialScreenDefaults[task].description,
    ...parseBaseNodeData(data),
    ...taskDefaults[task],
    ...(data || {}),
  } as EnhancedTextInput;
};

const baseEnhancedTextInputSchema: SchemaOf<BaseEnhancedTextInput> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string().required(),
      description: richText(),
    }),
  );

export const taskSchemas = {
  projectDescription: baseEnhancedTextInputSchema.concat(
    object({
      fn: mixed()
        .oneOf(["proposal.description"] as const)
        .required(),
      task: mixed()
        .oneOf(["projectDescription"] as const)
        .required(),
      revisionTitle: string().required(),
      revisionDescription: richText().required(),
    }),
  ),
} satisfies Record<Task, SchemaOf<EnhancedTextInputForTask<Task>>>;

export const validationSchema = lazy(
  (component: EnhancedTextInput) => taskSchemas[component.task],
);

export const TASKS: Record<Task, { label: string; description: string }> = {
  projectDescription: {
    label: "Project description (max 250 characters)",
    description: "Lorem ispum....",
  },
};
