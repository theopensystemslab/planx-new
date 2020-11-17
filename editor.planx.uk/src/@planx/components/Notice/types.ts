import { MoreInformation, parseMoreInformation } from "../shared";

export interface Notice extends MoreInformation {
  title: string;
  description: string;
  color: string;
  notes?: string;
  resetButton?: boolean;
}

export const parseNotice = (data: Record<string, any> | undefined) => ({
  // TODO: improve runtime validation here (joi, io-ts)
  title: data?.title || "",
  description: data?.description || "",
  color: data?.color || "#EFEFEF",
  resetButton: data?.resetButton || false,
  ...parseMoreInformation(data),
});
