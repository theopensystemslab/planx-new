import { MoreInformation, parseMoreInformation } from "../shared";

export interface Page extends MoreInformation {
  fn: string;
}

export const parsePage = (data: Record<string, any> | undefined): Page => ({
  fn: data?.fn || "",
  ...parseMoreInformation(data),
});
