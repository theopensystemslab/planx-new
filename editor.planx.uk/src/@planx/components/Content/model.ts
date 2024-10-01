import { BaseNodeData, parseBaseNodeData } from "../shared";

export interface Content extends BaseNodeData {
  content: string;
  color?: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): Content => ({
  content: data?.content || "",
  color: data?.color,
  ...parseBaseNodeData(data),
});
