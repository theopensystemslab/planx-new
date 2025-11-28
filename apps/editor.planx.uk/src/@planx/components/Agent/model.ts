import { richText } from "lib/yupExtensions";
import { lazy, mixed, object, type SchemaOf, string } from "yup";

import { baseNodeDataValidationSchema, parseBaseNodeData } from "../shared";
import {
  type Agent,
  type AgentForTask,
  type BaseAgent,
  type BreadcrumbData,
  type Task,
  type TaskDefaults,
} from "./types";

const taskDefaults: TaskDefaults = {
  enhanceProjectDescription: {
    abc: "",
  },
  validateDrawings: {
    def: "",
  },
};

export const parseAgent = (data: Partial<Agent> | undefined): Agent => {
  const task = data?.task || "enhanceProjectDescription";

  return {
    task,
    title: data?.title || "",
    description: data?.description,
    fn: data?.fn || "",
    ...parseBaseNodeData(data),
    ...taskDefaults[task],
    ...(data || {}),
  } as Agent;
};

const baseAgentSchema: SchemaOf<BaseAgent> =
  baseNodeDataValidationSchema.concat(
    object({
      fn: string(),
      title: string().required(),
      description: richText(),
    }),
  );

export const taskSchemas = {
  enhanceProjectDescription: baseAgentSchema.concat(
    object({
      task: mixed()
        .oneOf(["enhanceProjectDescription"] as const)
        .required(),
      abc: string().optional(),
    }),
  ),
  validateDrawings: baseAgentSchema.concat(
    object({
      task: mixed()
        .oneOf(["validateDrawings"] as const)
        .required(),
      def: string().optional(),
    }),
  ),
} satisfies Record<Task, SchemaOf<AgentForTask<Task>>>;

export const validationSchema = lazy(
  (breadcrumbData: BreadcrumbData) => taskSchemas[breadcrumbData.task],
);

export const TASKS: Record<Task, { label: string; description: string }> = {
  enhanceProjectDescription: {
    label: "Enhance project description",
    description: "Lorem ispum....",
  },
  validateDrawings: {
    label: "Validate drawings",
    description: "Lorem ispum....",
  },
};
