import { BaseNodeData, parseBaseNodeData } from "../shared";

export interface NextSteps extends BaseNodeData {
  title: string;
  description: string;
  steps: Array<Step>;
}

export interface Step {
  title: string;
  description: string;
  url?: string;
}

export const parseNextSteps = (
  data: Record<string, any> | undefined,
): NextSteps => ({
  steps: data?.steps || [],
  title: data?.title || DEFAULT_TITLE,
  description: data?.description || "",
  ...parseBaseNodeData(data),
});

const DEFAULT_TITLE = "What would you like to do next?";
