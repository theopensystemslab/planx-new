import { MoreInformation, parseMoreInformation } from "../shared";

export interface DrawBoundary extends MoreInformation {
  title: string;
  description: string;
  titleForUploading: string;
  descriptionForUploading: string;
  dataFieldBoundary: string;
  dataFieldArea: string;
}

export const parseDrawBoundary = (
  data: Record<string, any> | undefined
): DrawBoundary => ({
  ...parseMoreInformation(data),
  title: data?.title || "",
  description: data?.description || "",
  titleForUploading: data?.titleForUploading || "",
  descriptionForUploading: data?.descriptionForUploading || "",
  dataFieldBoundary: data?.dataFieldBoundary || "",
  dataFieldArea: data?.dataFieldArea || "",
});

export const DEFAULT_TITLE = "Draw the boundary of the property" as const;
export const DEFAULT_TITLE_FOR_UPLOADING = "Upload the PDF location plan" as const;
