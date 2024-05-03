import { MoreInformation, parseMoreInformation } from "../shared";

export interface List extends MoreInformation {
  fn: string;
}

export const parseContent = (data: Record<string, any> | undefined): List => ({
  fn: data?.fn || "",
  ...parseMoreInformation(data),
});
