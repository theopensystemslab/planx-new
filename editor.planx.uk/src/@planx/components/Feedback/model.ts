import { BaseNodeData, parseBaseNodeData } from "../shared";
export interface Feedback extends BaseNodeData {
  title: string;
}
export const parseFeedback = (
  data: Record<string, any> | undefined,
): Feedback => ({
  title: data?.title || "",
  ...parseBaseNodeData(data),
});
