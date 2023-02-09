import { MoreInformation, parseMoreInformation } from "../shared";

export enum Destination {
  BOPS = "bops",
  Uniform = "uniform",
  Email = "email",
}

export interface Send extends MoreInformation {
  title: string;
  destinations: Destination[];
}

export const DEFAULT_TITLE = "Send";
export const DEFAULT_DESTINATION = Destination.BOPS;

export const parseContent = (data: Record<string, any> | undefined): Send => ({
  ...parseMoreInformation(data),
  title: data?.title || DEFAULT_TITLE,
  destinations: data?.destinations || [DEFAULT_DESTINATION],
});

export const USER_ROLES = ["applicant", "agent", "proxy"] as const;

// See minimum POST schema for /api/v1/planning_applications
// https://ripa.bops.services/api-docs/index.html
interface BOPSMinimumPayload {
  application_type: "lawfulness_certificate" | string;
  site: {
    uprn?: string;
    address_1: string;
    address_2?: string;
    town?: string;
    postcode?: string;
    latitude: string;
    longitude: string;
    x: string;
    y: string;
    source: string;
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
  feedback?: {
    result?: string;
    find_property?: string;
    planning_constraints?: string;
  };
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
  portal_name?: string;
  feedback?: string;
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

// CSV data structure sent to Uniform & re-used for user download on Confirmation page
interface CSVRow {
  question: string;
  responses: any;
  metadata?: any;
}

export type CSVData = CSVRow[];
