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
  title: data?.title || "",
  description: data?.description || "",
  titleForUploading: data?.titleForUploading || "",
  descriptionForUploading: data?.descriptionForUploading || "",
  dataFieldBoundary: data?.dataFieldBoundary || DEFAULT_PASSPORT_BOUNDARY_KEY,
  dataFieldArea: data?.dataFieldArea || "",
});

const DEFAULT_PASSPORT_BOUNDARY_KEY = "property.boundary.site" as const;
export const DEFAULT_TITLE = "Draw the boundary of the property" as const;
export const DEFAULT_TITLE_FOR_UPLOADING = "Upload the PDF location plan" as const;
export const PASSPORT_UPLOAD_KEY = "proposal.drawing.locationPlan" as const; // not added to editor yet
