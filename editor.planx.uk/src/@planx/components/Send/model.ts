import { parseMoreInformation } from "../shared";

export interface Send {
  url: string;
}

export const parseContent = (data: Record<string, any> | undefined): Send => ({
  url: data?.url || "",
  ...parseMoreInformation(data),
});
