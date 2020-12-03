import { parseMoreInformation } from "../shared";

export interface Send {
  title?: string;
  description?: string;
  url: string;
}

export const parseContent = (data: Record<string, any> | undefined): Send => ({
  title: data?.title || "",
  description: data?.description || "",
  url: data?.url || "",
  ...parseMoreInformation(data),
});
