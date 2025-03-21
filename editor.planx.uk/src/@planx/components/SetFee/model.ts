import { BaseNodeData, parseBaseNodeData } from "../shared";

export interface SetFee extends BaseNodeData {
  fn: string;
}

export const parseSetFee = (
  data: Record<string, any> | undefined,
): SetFee => ({
  fn: data?.fn || "",
  ...parseBaseNodeData(data),
});
