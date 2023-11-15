import { MoreInformation, parseMoreInformation } from "../shared";

export interface Content extends MoreInformation {
  customBackground: boolean;
  content: string;
  color?: string;
}

export const parseContent = (
  data: Record<string, any> | undefined,
): Content => ({
  content: data?.content || "",
  color: data?.color,
  customBackground: data?.customBackground,
  ...parseMoreInformation(data),
});
