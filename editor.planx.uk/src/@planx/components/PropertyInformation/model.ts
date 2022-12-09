import { MoreInformation, parseMoreInformation } from "../shared";

export interface PropertyInformation extends MoreInformation {
  title: string;
  description: string;
}

export const parsePropertyInformation = (
  data: Record<string, any> | undefined
): PropertyInformation => ({
  title: data?.title || "",
  description: data?.description || "",
  ...parseMoreInformation(data),
});

export const DEFAULT_TITLE = "About the property" as const;
