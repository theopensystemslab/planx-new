import { useFormik } from "formik";

export type FormikHookReturn = ReturnType<typeof useFormik>;

export interface Flow {
  id: string;
  slug: string;
  team: Team;
  settings?: FlowSettings;
}

export interface Team {
  name: string;
  slug: string;
  settings?: TeamSettings;
  theme?: {
    primary?: string;
    logo?: string;
  };
}

interface TeamSettings {
  design?: {
    color?: string;
  };
}

export const FOOTER_ITEMS = [
  "help",
  "privacy",
  "accessibility",
  "license",
  "cookies",
  "termsOfUse",
];

const FLOW_SETTINGS = [...FOOTER_ITEMS, "legalDisclaimer"] as const;
export interface FlowSettings {
  elements?: {
    [key in typeof FLOW_SETTINGS[number]]?: TextContent;
  };
}

export interface TextContent {
  heading: string;
  content: string;
  show: boolean;
}

export interface Flag {
  category: string;
  value?: string;
  text: string;
  bgColor: string;
  color: string;
}

export interface Node {
  id: string;
  data: {
    text: string;
    flag?: string;
    info?: string;
    policyRef?: string;
  };
}

// https://docs.payments.service.gov.uk/making_payments/#receiving-the-api-response
export interface GovUKPayment {
  amount: number;
  reference: string;
  state: {
    // https://docs.payments.service.gov.uk/api_reference/#status-and-finished
    status:
      | "created"
      | "started"
      | "submitted"
      | "capturable"
      | "success"
      | "failed"
      | "cancelled"
      | "error";
    finished: boolean;
  };
  payment_id: string;
  created_date: string;
  _links: {
    self: {
      href: string;
      method: string;
    };
    next_url?: {
      href: string;
      method: string;
    };
    next_url_post: {
      type: string;
      params: {
        chargeTokenId: string;
      };
      href: string;
      method: string;
    };
  };
}
