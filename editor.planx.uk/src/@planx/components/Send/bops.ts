// API Documentation: https://ripa.bops-staging.services/api-docs/index.html

// minimumPayload and fullPayload are the minimum and full expected
// POST data payloads accepted by the BOPS API, see:
// https://southwark.preview.bops.services/api-docs/index.html

import { flatFlags } from "pages/FlowEditor/data/flags";

import { Store } from "../../../pages/FlowEditor/lib/store";
import { TYPES } from "../types";

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
}

interface QuestionMetaData {
  notes?: string;
  auto_answered?: boolean;
  policy_refs?: Array<{
    url?: string;
    text?: string;
  }>;
}

interface ResponseMetaData {
  flags?: Array<string>;
}

interface Response {
  value: string;
  metadata?: ResponseMetaData;
}

interface QuestionAndResponses {
  question: string;
  metadata?: QuestionMetaData;
  responses: Array<Response>;
}

interface File {
  filename: string;
  tags?: Array<string>;
}

export const bopsDictionary = {
  // address data taken from passport.info atm

  // uprn: "property.uprn",
  // address_1: "property.address.line1",
  // address_2: "property.address.line2",
  // town: "property.address.town",
  // postcode: "property.postcode",

  // constraints => passport[property.constraints.planning]

  // TODO: add ward property
  // ward: "property.ward",

  // TODO: derive application_type value, it's currently hardcoded
  // application_type => application_type, work_status

  applicant_first_name: "applicant.name.first",
  applicant_last_name: "applicant.name.last",
  applicant_phone: "applicant.phone.primary",
  applicant_email: "applicant.email",

  agent_first_name: "applicant.agent.name.first",
  agent_last_name: "applicant.agent.name.last",
  agent_phone: "applicant.agent.phone.primary",
  agent_email: "applicant.agent.email",

  payment_reference: "application.fee.reference.govPay",
  description: "proposal.description",
};

const minimumPayload: BOPSMinimumPayload = {
  application_type: "lawfulness_certificate",
  site: {
    uprn: "",
    address_1: "",
    // address_2: "",
    town: "",
    postcode: "",
  },
};

export const makePayload = (flow: Store.flow, breadcrumbs: Store.breadcrumbs) =>
  Object.entries(breadcrumbs)
    .filter(([id]) => {
      if (!flow[id]?.type) return false;

      const validType = [
        TYPES.Checklist,
        TYPES.Statement,
        TYPES.TextInput,
      ].includes(flow[id].type as number);

      const validKey = !Object.values(bopsDictionary).includes(
        flow[id]?.data?.fn
      );

      return validType && validKey;
    })
    .map(([id, bc]) => {
      const { edges = [], ...question } = flow[id];

      const answers: Array<string> = bc.answers ?? [];

      const responses = answers.map((id) => {
        let value = id;
        const metadata: ResponseMetaData = {};

        if (flow[id]) {
          value = flow[id].data?.text || flow[id].data?.title || "";
          if (flow[id].data?.flag) {
            const flag = flatFlags.find((f) => f.value === flow[id].data?.flag);
            if (flag) {
              metadata.flags = [`${flag.category} / ${flag.text}`];
            }
          }
        }

        const ob: Response = { value };
        if (Object.keys(metadata).length > 0) ob.metadata = metadata;
        return ob;
      });

      const ob: QuestionAndResponses = {
        question: question?.data?.text || question?.data?.title || "",
        responses,
      };

      const metadata: QuestionMetaData = {};
      if (bc.auto) metadata.auto_answered = true;
      if (flow[id]?.data?.policyRef) {
        metadata.policy_refs = [
          // remove html tags
          { text: flow[id].data.policyRef.replace(/<[^>]*>/g, "").trim() },
        ];
      }
      if (Object.keys(metadata).length > 0) ob.metadata = metadata;

      return ob;
    })
    .filter(Boolean);

export const fullPayload: BOPSFullPayload = {
  ...minimumPayload,

  work_status: "proposed",

  // TODO: remove hardcoded demo value
  payment_reference: "JG669323",

  proposal_details: [],
  constraints: {},
  files: [] as Array<File>,
};
