import { BaseNodeData } from "../shared";

export interface Review extends BaseNodeData {
  title: string;
  description: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): Review => ({
  title: data?.title || "Check your answers before sending your application",
  description: data?.description || "",
  notes: data?.notes || "",
});
