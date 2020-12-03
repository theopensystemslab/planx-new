import { MoreInformation, parseMoreInformation } from "../shared";

export interface Content extends MoreInformation {
  content: string;
  color?: string;
}

export const parseContent = (
  data: Record<string, any> | undefined
): Content => ({
  // TODO: improve runtime validation here (joi, io-ts)
  content: data?.content || "",
  color: data?.color,
  ...parseMoreInformation(data),
});
