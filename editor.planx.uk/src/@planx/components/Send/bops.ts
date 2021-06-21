// API Documentation: https://ripa.bops.services/api-docs/index.html

// minimumPayload and fullPayload are the minimum and full expected
// POST data payloads accepted by the BOPS API, see:
// https://southwark.preview.bops.services/api-docs/index.html

import { flatFlags } from "pages/FlowEditor/data/flags";
import { GovUKPayment } from "types";

import { Store } from "../../../pages/FlowEditor/lib/store";
import { PASSPORT_UPLOAD_KEY } from "../DrawBoundary/model";
import { GOV_PAY_PASSPORT_KEY } from "../Pay/model";
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

  applicant_first_name: "applicant.name.first",
  applicant_last_name: "applicant.name.last",
  applicant_phone: "applicant.phone.primary",
  applicant_email: "applicant.email",

  agent_first_name: "applicant.agent.name.first",
  agent_last_name: "applicant.agent.name.last",
  agent_phone: "applicant.agent.phone.primary",
  agent_email: "applicant.agent.email",

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

      const answers: Array<string> = (() => {
        if (flow[id].type === TYPES.TextInput) {
          return Object.values(bc.data ?? {}).filter(
            (x) => typeof x === "string"
          );
        } else {
          return bc.answers ?? [];
        }
      })();

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

  payment_reference: "JG669323",

  proposal_details: [],
  constraints: {},
  files: [] as Array<File>,
};

export function getParams(
  breadcrumbs: Store.breadcrumbs,
  flow: Store.flow,
  passport: Store.passport,
  sessionId: string
) {
  const data = fullPayload;

  // 1a. address

  const address = passport.data?._address;
  if (address) {
    data.site.uprn = String(address.uprn);

    data.site.address_1 = [address.sao, address.pao, address.street]
      .filter(Boolean)
      .join(" ");

    data.site.town = address.town;
    data.site.postcode = address.postcode;
  }

  // 1b. property boundary

  try {
    // find the first draw boundary component breadcrumb
    const boundaryBreadcrumb = Object.entries(breadcrumbs).find(
      ([questionId]) => flow[questionId]?.type === TYPES.DrawBoundary
    );
    if (boundaryBreadcrumb) {
      const [, { data: breadcrumbData }] = boundaryBreadcrumb;
      if (breadcrumbData) {
        // scan the breadcrumb's data object (what got saved to passport)
        // and extract the first instance of any geojson that's found
        const geojson = Object.values(breadcrumbData).find(
          (v) => v?.type === "Feature"
        );
        if (geojson) data.boundary_geojson = geojson;
      }
    }
  } catch (err) {
    console.error({ boundary_geojson: err });
  }

  // 2. files

  Object.entries(passport.data || {})
    .filter(([, v]: any) => v?.[0]?.url)
    .forEach(([key, arr]) => {
      (arr as any[]).forEach(({ url }) => {
        try {
          data.files = data.files || [];
          data.files.push({
            filename: url,
            tags: [], // should be [key], but BOPS will reject unless it's a specific string
          });
        } catch (err) {}
      });
    });

  // 2a. property boundary file if the user didn't draw

  if (passport?.data?.[PASSPORT_UPLOAD_KEY]) {
    data.files?.push({
      filename: passport?.data[PASSPORT_UPLOAD_KEY],
      tags: [],
    });
  }

  // 3. constraints

  data.constraints = (
    passport.data?.["property.constraints.planning"] || []
  ).reduce((acc: Record<string, boolean>, curr: string) => {
    acc[curr] = true;
    return acc;
  }, {});

  // 4. work status

  if (passport?.data?.["property.constraints.planning"] === "ldc.existing") {
    data.work_status = "existing";
  }

  // 5. keys

  const bopsData = Object.entries(bopsDictionary).reduce(
    (acc, [bopsField, planxField]) => {
      const value = passport.data?.[planxField];
      if (value !== undefined && value !== null) {
        acc[bopsField as keyof BOPSFullPayload] = value;
      }
      return acc;
    },
    {} as Partial<BOPSFullPayload>
  );

  // 6. questions+answers array

  data.proposal_details = makePayload(flow, breadcrumbs);

  // 7. payment

  const payment = passport?.data?.[GOV_PAY_PASSPORT_KEY] as GovUKPayment;
  if (payment) {
    data.payment_amount = payment.amount;
    data.payment_reference = payment.payment_id;
  }

  return {
    ...data,
    ...bopsData,
    ...(sessionId ? { session_id: sessionId } : {}),
  };
}
