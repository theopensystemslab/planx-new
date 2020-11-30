import { parseMoreInformation } from "../shared";

export interface Notify {
  url: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): Notify => ({
  url: data?.url || "",
  ...parseMoreInformation(data),
});
