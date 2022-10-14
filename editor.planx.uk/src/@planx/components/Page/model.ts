import type { MoreInformation } from "../shared";
import { parseMoreInformation } from "../shared";

export type UserData = string;

export interface Page extends MoreInformation {
  title: string;
  description: string;
}

export const parsePage = (data: Record<string, any> | undefined): Page => ({
  title: data?.title || "",
  description: data?.description || "",
  ...parseMoreInformation(data),
});
