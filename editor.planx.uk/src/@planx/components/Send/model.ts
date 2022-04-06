import { MoreInformation, parseMoreInformation } from "../shared";

export enum Destination {
  BOPS = "bops",
  Uniform = "uniform",
}

export interface Send extends MoreInformation {
  title: string;
  destination: Destination;
}

export const DEFAULT_TITLE = "Send to BOPs";
export const DEFAULT_DESTINATION = Destination.BOPS;

export const parseContent = (data: Record<string, any> | undefined): Send => ({
  ...parseMoreInformation(data),
  title: data?.title || DEFAULT_TITLE,
  destination: data?.destination || DEFAULT_DESTINATION,
});

export const USER_ROLES = ["applicant", "agent", "proxy"] as const;

// See minimum POST schema for /api/v1/planning_applications
// https://ripa.bops.services/api-docs/index.html
interface BOPSMinimumPayload {
  application_type: "lawfulness_certificate";
  site: {
    uprn: string;
    address_1: string;
    address_2?: string;
    town: string;
    postcode: string;
    latitude: string;
    longitude: string;
    warning?: {
      show: boolean;
      os_administrative_area: string;
      os_local_custodian_code: string;
      planx_team_name?: string;
    };
  };
  applicant_email: string;
}

export interface BOPSFullPayload extends BOPSMinimumPayload {
  description?: string;
  payment_reference?: string;
  payment_amount?: number;
  ward?: string;
  work_status?: "proposed" | "existing";
  applicant_first_name?: string;
  applicant_last_name?: string;
  applicant_phone?: string;
  agent_first_name?: string;
  agent_last_name?: string;
  agent_phone?: string;
  agent_email?: string;
  proposal_details?: Array<QuestionAndResponses>;
  constraints?: Record<string, boolean>;
  files?: Array<File>;
  boundary_geojson?: Object;
  result?: {
    flag?: string;
    heading?: string;
    description?: string;
    override?: string;
  };
  planx_debug_data?: Record<string, unknown>;
  // typeof arr[number] > https://steveholgado.com/typescript-types-from-arrays
  user_role?: typeof USER_ROLES[number];
  proposal_completion_date?: string;
}

export interface QuestionMetaData {
  notes?: string;
  auto_answered?: boolean;
  policy_refs?: Array<{
    url?: string;
    text?: string;
  }>;
}

export interface ResponseMetaData {
  flags?: Array<string>;
}

export interface Response {
  value: string;
  metadata?: ResponseMetaData;
}

export interface QuestionAndResponses {
  question: string;
  metadata?: QuestionMetaData;
  responses: Array<Response>;
}

// Using PLAN_TAGS & EVIDENCE_TAGS provided by BOPS, from:
// https://github.com/unboxed/bops/blob/master/app/models/document.rb
// will also be in POST Schema https://ripa.bops.services/api-docs
type PlanTag =
  | "Front"
  | "Rear"
  | "Side"
  | "Roof"
  | "Floor"
  | "Site"
  | "Plan"
  | "Elevation"
  | "Section"
  | "Proposed"
  | "Existing";

type EvidenceTag =
  | "Photograph"
  | "Utility Bill"
  | "Building Control Certificate"
  | "Construction Invoice"
  | "Council Tax Document"
  | "Tenancy Agreement"
  | "Tenancy Invoice"
  | "Bank Statement"
  | "Statutory Declaration"
  | "Other"
  | "Sitemap";

export type FileTag = PlanTag | EvidenceTag;

interface File {
  filename: string;
  tags?: Array<FileTag>;
  applicant_description?: string;
}

// Uniform LDC XML
// Based on "existing" & "proposed" sample .zips attached here https://trello.com/c/lVOPqsoY/1450-send-data-to-uniform
export interface DataModel {
  siteAddress: {
    uprn: string;
    easting: string;
    northing: string;
    description: string;
    displayStreet1: string;
    displayStreet2: string;
    town: string;
    postcode: string;
    county: string;
    addressLineSingle: string;
  };
  formType: "4114" | "4140"; // existing = 4114; proposed = 4140 ??
  Applicant: {
    Forename: string;
    Surname: string;
    Title: string;
    CompanyName: string;
    Address1: string;
    Address2: string;
    Postcode: string;
    Town: string;
    County: string;
    Country: string;
    TelNo: string;
    Email: string;
  };
  App: { Areyouanagent: "Yes" | "No" }; // user.role === "agent" ? "Yes" : "No"
  Agent?: {
    Forename: string;
    Surname: string;
    Title: string;
    CompanyName: string;
    Address1: string;
    Address2: string;
    Postcode: string;
    Town: string;
    County: string;
    Country: string;
    TelNo: string;
    Email: string;
  };
  ApplicationData: {
    CertificateLawfulness: CertificateLawfulness;
    Advice: { HaveSoughtAdvice: "Yes" | "No" };
    SiteVisit: { SeeSite: "Yes" | "No" };
  };
  DeclarationOfInterest: {
    IsRelated: "Yes" | "No";
    RelationDetails: string;
  };
  Declaration: {
    DeclarationMade: { string: string };
    DeclarationDate: string;
  };
  emailconfirmationTelephone: string;
  emailconfirmationEmail: string;
  emailconfirmationSurname: string;
  emailconfirmationForename: string;
}

export interface CertificateLawfulness {
  ExistingUseApplication?: ExistingUseApplication;
  ProposedUseApplication?: ProposedUseApplication;
}

export interface ExistingUseApplication {
  DescriptionCEU: string;
  GroundsCEU: {
    ApplicationSiteRefList: {
      ApplicationSiteRef: {
        ReferenceDate: string;
        Reference: string;
        ConditionNumber: string;
      };
    };
    CertificateLawfulnessReason: string;
  };
  InformationCEU: {
    IsExistingUseInterruption: string;
    UseBegunDate: string;
    InterruptionDetails: string;
    IsExistingUseChange: string;
    ExistingUseChangeDetails: string;
    IsResidentialUseChange: string;
  };
}

export interface ProposedUseApplication {
  DescriptionCPU: {
    IsProposedOperationBuilding: string;
    OperationsDescription: string;
    IsUseChange: string;
    ProposedUseDescription: string;
    ExistingUseDescription: string;
    IsUseStarted: string;
  };
  GroundsCPU: {
    UseLawfulnessReason: string;
    SupportingInformation: { Reference: string };
    ProposedUseStatus: string;
    LawfulDevCertificateReason: string;
  };
}
