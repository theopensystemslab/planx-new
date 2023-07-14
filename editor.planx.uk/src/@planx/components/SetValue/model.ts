import { MoreInformation, parseMoreInformation } from "../shared";

export interface SetValue extends MoreInformation {
  fn: string;
  val: string;
}

export const parseSetValue = (
  data: Record<string, any> | undefined,
): SetValue => ({
  fn: data?.fn || "",
  val: data?.val || "",
  ...parseMoreInformation(data),
});
