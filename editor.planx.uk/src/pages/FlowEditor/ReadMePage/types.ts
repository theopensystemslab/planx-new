import { FlowInformation } from "../utils";

export interface ReadMePageProps {
  flowInformation: FlowInformation;
  teamSlug: string;
}

export interface ReadMePageForm {
  serviceSummary: string;
  serviceDescription: string;
  serviceLimitations: string;
}
