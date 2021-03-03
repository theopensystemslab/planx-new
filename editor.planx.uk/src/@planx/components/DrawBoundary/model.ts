import { MoreInformation, parseMoreInformation } from "../shared";

export interface DrawBoundary extends MoreInformation {
  title: string;
  description: string;
  dataFieldBoundary: string;
  dataFieldArea: string;
}

export const parseDrawBoundary = (
  data: Record<string, any> | undefined
): DrawBoundary => ({
  ...parseMoreInformation(data),
  title: data?.title || "",
  description: data?.description || "",
  dataFieldBoundary: data?.dataFieldBoundary || "",
  dataFieldArea: data?.dataFieldArea || "",
});

export const DEFAULT_TITLE = "Draw the boundary of the property" as const;
