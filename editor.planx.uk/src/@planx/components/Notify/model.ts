import { parseMoreInformation } from "../shared";

export interface Notify {
  title?: string;
  description?: string;
  url: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): Notify => ({
  title: data?.title || "",
  description: data?.description || "",
  url: data?.url || "",
  ...parseMoreInformation(data),
});
