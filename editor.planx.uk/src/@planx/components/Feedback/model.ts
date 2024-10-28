import { BaseNodeData, parseBaseNodeData } from "../shared";

export interface Feedback extends BaseNodeData {
  fn: string;
}

export const parseFeedback = (
  data: Record<string, any> | undefined,
): Feedback => ({
  fn: data?.fn || "",
  ...parseBaseNodeData(data),
});
