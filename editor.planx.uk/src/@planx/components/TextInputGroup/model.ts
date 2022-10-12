import { MoreInformation, parseMoreInformation } from "../shared";

export interface TextInputGroup extends MoreInformation {
  fn: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): TextInputGroup => ({
  fn: data?.fn || "",
  ...parseMoreInformation(data),
});
