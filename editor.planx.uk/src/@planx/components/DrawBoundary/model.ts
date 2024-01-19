import { MoreInformation, parseMoreInformation } from "../shared";
import { content } from "./content";

export enum DrawBoundaryUserAction {
  Accept = "Accepted the title boundary",
  Amend = "Amended the title boundary",
  Draw = "Drew a custom boundary",
  Upload = "Uploaded a location plan",
}

export interface DrawBoundary extends MoreInformation {
  title: string;
  description: string;
  titleForUploading: string;
  descriptionForUploading: string;
  hideFileUpload?: boolean;
  dataFieldBoundary: string;
  dataFieldArea: string;
  info?: string;
  policyRef?: string;
  howMeasured?: string;
  definitionImg?: string;
}

export const parseDrawBoundary = (
  data: Record<string, any> | undefined,
): DrawBoundary => ({
  ...parseMoreInformation(data),
  title: data?.title || content?.["title"],
  description: data?.description || content?.["description"],
  titleForUploading: data?.titleForUploading || content?.["titleForUploading"],
  descriptionForUploading:
    data?.descriptionForUploading || content?.["descriptionForUploading"],
  hideFileUpload: data?.hideFileUpload || content?.["hideFileUpload"],
  dataFieldBoundary: data?.dataFieldBoundary || content?.["dataFieldBoundary"],
  dataFieldArea: data?.dataFieldArea || content?.["dataFieldArea"],
  info: data?.info || content?.["info"],
  policyRef: data?.policyRef || content?.["policyRef"],
  howMeasured: data?.howMeasured || content?.["howMeasured"],
  definitionImg: data?.definitionImg || content?.["definitionImg"],
});

export const PASSPORT_UPLOAD_KEY = "proposal.drawing.locationPlan" as const; // not added to editor yet
export const PASSPORT_COMPONENT_ACTION_KEY = "drawBoundary.action" as const; // internal use only
