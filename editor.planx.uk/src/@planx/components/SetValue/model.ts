import { MoreInformation, parseMoreInformation } from "../shared";

export interface SetValue extends MoreInformation {
  fn: string;
  val: string;
  operation: "replace" | "append" | "remove";
}

export const parseSetValue = (
  data: Record<string, any> | undefined,
): SetValue => ({
  fn: data?.fn || "",
  val: data?.val || "",
  operation: "replace",
  ...parseMoreInformation(data),
});
