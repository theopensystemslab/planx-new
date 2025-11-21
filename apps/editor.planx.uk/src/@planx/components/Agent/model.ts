import { mixed, object, type SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";

export interface BaseAgent extends BaseNodeData {
  fn?: string;
}

interface EnhanceProjectDescriptionTask {
  task: "enhanceProjectDescription";
  // TODO: other props
}

interface ValidateDrawingsTask {
  task: "validateDrawings";
  // TODO: other props
}

type AgentTask = EnhanceProjectDescriptionTask | ValidateDrawingsTask;

export type Task = AgentTask["task"];
export const TASKS: Task[] = ["enhanceProjectDescription", "validateDrawings"];

/**
 * Database representation of an "Agent" node
 */
export type Agent = BaseAgent & AgentTask;

export const parseAgent = (data: Partial<Agent> | undefined): Agent => ({
  fn: data?.fn || "",
  task: data?.task || "enhanceProjectDescription",
  ...parseBaseNodeData(data),
});

export const validationSchema: SchemaOf<Agent> =
  baseNodeDataValidationSchema.concat(
    object({
      fn: string(),
      task: mixed().oneOf(TASKS),
    }),
  );
