import { parseMoreInformation } from "../shared";

export interface Send {}

export const parseContent = (data: Record<string, any> | undefined): Send => ({
  ...parseMoreInformation(data),
});

export const BOPS_URL = `${process.env.REACT_APP_API_URL}/bops`;

interface BOPSMinimumPayload {
  application_type: "lawfulness_certificate";
  site: {
    uprn: string;
    address_1: string;
    address_2?: string;
    town: string;
    postcode: string;
  };
}

export interface BOPSFullPayload extends BOPSMinimumPayload {
  description?: string;
  payment_reference?: string;
  payment_amount?: number;
  session_id?: string;
  ward?: string;
  work_status?: "proposed" | "existing";
  applicant_first_name?: string;
  applicant_last_name?: string;
  applicant_phone?: string;
  applicant_email?: string;
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

interface File {
  filename: string;
  tags?: Array<string>;
}

// Extracted from:
// https://github.com/unboxed/bops/blob/master/app/models/document.rb
export enum BOPS_TAGS {
  Front = "Front",
  Rear = "Rear",
  Side = "Side",
  Roof = "Roof",
  Floor = "Floor",
  Site = "Site",
  Plan = "Plan",
  Elevation = "Elevation",
  Section = "Section",
  Proposed = "Proposed",
  Existing = "Existing",
}
