import { BaseNodeData, parseBaseNodeData } from "../shared";

export interface ResponsiveChecklist extends BaseNodeData {
  fn: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): ResponsiveChecklist => ({
  fn: data?.fn || "",
  ...parseBaseNodeData(data),
});
