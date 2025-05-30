import { BaseNodeData, parseBaseNodeData } from "../shared";

export interface ResponsiveQuestion extends BaseNodeData {
  fn: string;
}

export const parseResponsiveQuestion = (
  data: Record<string, any> | undefined,
): ResponsiveQuestion => ({
  fn: data?.fn || "",
  ...parseBaseNodeData(data),
});
