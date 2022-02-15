import { MoreInformation, parseMoreInformation } from "../shared";

export interface DrawBoundary extends MoreInformation {
  title: string;
  description: string;
  titleForUploading: string;
  descriptionForUploading: string;
  dataFieldBoundary: string;
  dataFieldArea: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
  definitionImg?: string;
}

export const parseDrawBoundary = (
  data: Record<string, any> | undefined
): DrawBoundary => ({
  ...parseMoreInformation(data),
  title: data?.title || DEFAULT_TITLE,
  description: data?.description || "",
  titleForUploading: data?.titleForUploading || DEFAULT_TITLE_FOR_UPLOADING,
  descriptionForUploading: data?.descriptionForUploading || "",
  dataFieldBoundary: data?.dataFieldBoundary || DEFAULT_PASSPORT_BOUNDARY_KEY,
  dataFieldArea: data?.dataFieldArea || DEFAULT_PASSPORT_AREA_KEY,
});

export const DEFAULT_PASSPORT_BOUNDARY_KEY = "property.boundary.site" as const;
export const DEFAULT_PASSPORT_AREA_KEY = "property.boundary.area" as const;
export const DEFAULT_TITLE = "Draw the boundary of the property" as const;
export const DEFAULT_TITLE_FOR_UPLOADING = "Upload a location plan" as const;
export const PASSPORT_UPLOAD_KEY = "proposal.drawing.locationPlan" as const; // not added to editor yet
export const PASSPORT_UPLOADED_FILE_KEY = "property.uploadedFile";
