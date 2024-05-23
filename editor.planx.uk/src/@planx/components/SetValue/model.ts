import { MoreInformation, parseMoreInformation } from "../shared";

export interface SetValue extends MoreInformation {
  fn: string;
  val: string;
  operation: "replace" | "append" | "removeOne" | "removeAll";
}

export const parseSetValue = (
  data: Record<string, any> | undefined,
): SetValue => ({
  fn: data?.fn || "",
  val: data?.val || "",
  operation: data?.operation || "replace",
  ...parseMoreInformation(data),
});
