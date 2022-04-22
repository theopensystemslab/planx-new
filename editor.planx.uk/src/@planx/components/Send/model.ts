import { MoreInformation, parseMoreInformation } from "../shared";

export enum Destination {
  BOPS = "bops",
  Uniform = "uniform",
}

export interface Send extends MoreInformation {
  title: string;
  destination: Destination;
}

export const DEFAULT_TITLE = "Send";
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
// ref "sample.xml" from Kev attached here https://trello.com/c/lVOPqsoY/1450-send-data-to-uniform
export interface UniformPayload {
  _declaration: {
    _attributes: {
      version: string;
      encoding: string;
    };
  };
  Envelope: {
    Body: {
      CreateDcApplication: {
        SubmittedDcApplication: {
          ApplicationIdentification: string;
          SiteLocation: {
            Address: string;
          };
          TypeOfApplication: {
            ApplicationType: string;
            ApplicationType_Text: string;
          };
          Proposal: string;
          ApplicantDetails: {
            ApplicantName: string;
            ApplicantPhoneNumber: string;
            ApplicantAddress: string;
            ApplicantContactDetails: {
              ApplicantContactDetail: {
                ContactTypeCode: string;
                ContactAddress: string;
              };
            };
          };
          AgentDetails: {
            AgentName: string;
            AgentPhoneNumber: string;
            AgentAddress: string;
            AgentContactDetails: {
              AgentContactDetail: {
                ContactTypeCode: string;
                ContactAddress: string;
              };
            };
          };
          ApplicationFee: {
            FeeAmount: string;
            PaymentDetails: {
              AmountReceived: string;
              PaymentMethod: string;
            };
          };
          ParkingProvision: string;
          ClassifiedRoads: string;
          ResidentialDetails: string;
          FloorspaceDetails: string;
          LandUse: string;
          EmploymentDetails: string;
          ListedBuilding: string;
        };
      };
    };
  };
}

// CSV data structure sent to Uniform & re-used for user download on Confirmation page
interface CSVRow {
  question: string;
  responses: any;
  metadata?: any;
}

export type CSVData = CSVRow[];
