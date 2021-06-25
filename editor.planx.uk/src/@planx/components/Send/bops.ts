// API Documentation: https://ripa.bops.services/api-docs/index.html

// minimumPayload and fullPayload are the minimum and full expected
// POST data payloads accepted by the BOPS API, see:
// https://southwark.preview.bops.services/api-docs/index.html

import { DEFAULT_FLAG_CATEGORY, flatFlags } from "pages/FlowEditor/data/flags";
import { getResultData } from "pages/FlowEditor/lib/store/preview";
import { GovUKPayment } from "types";

import { Store } from "../../../pages/FlowEditor/lib/store";
import { PASSPORT_UPLOAD_KEY } from "../DrawBoundary/model";
import { GOV_PAY_PASSPORT_KEY, toPence } from "../Pay/model";
import { TYPES } from "../types";
import type {
  BOPSFullPayload,
  QuestionAndResponses,
  QuestionMetaData,
  Response,
  ResponseMetaData,
} from "./model";

export const bopsDictionary = {
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

const makePayload = (flow: Store.flow, breadcrumbs: Store.breadcrumbs) =>
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

export function getParams(
  breadcrumbs: Store.breadcrumbs,
  flow: Store.flow,
  passport: Store.passport,
  sessionId: string
) {
  const data = {} as BOPSFullPayload;

  // Hardcode application type for now
  data.application_type = "lawfulness_certificate";

  if (sessionId) data.session_id = sessionId;

  // 1a. address

  const address = passport.data?._address;
  if (address) {
    const site = {} as BOPSFullPayload["site"];

    site.uprn = String(address.uprn);

    site.address_1 = [address.sao, address.pao, address.street]
      .filter(Boolean)
      .join(" ");

    site.town = address.town;
    site.postcode = address.postcode;

    data.site = site;
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
    .forEach(([, arr]) => {
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

  const constraints = (
    passport.data?.["property.constraints.planning"] || []
  ).reduce((acc: Record<string, boolean>, curr: string) => {
    acc[curr] = true;
    return acc;
  }, {});
  if (Object.values(constraints).map(Boolean).length > 0) {
    data.constraints = constraints;
  }

  // 4. work status

  switch (passport?.data?.["application.type"]) {
    case "ldc.existing":
      data.work_status = "existing";
      break;
    case "ldc.proposed":
      data.work_status = "proposed";
      break;
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
    data.payment_amount = toPence(payment.amount);
    data.payment_reference = payment.payment_id;
  }

  // 8. flag data

  const resultId = Object.keys(breadcrumbs).find(
    (id) => flow[id]?.type === TYPES.Result
  );
  if (resultId) {
    const result = getResultData(
      breadcrumbs,
      flow,
      DEFAULT_FLAG_CATEGORY,
      flow[resultId].data?.overrides
    );
    const firstResult = Object.values(result)?.[0] as any;
    const flag = firstResult?.flag?.value;

    if (flag) {
      data.result = Object.entries({
        flag: [firstResult.flag.category, firstResult.flag.text].join(" / "),
        heading: firstResult.displayText?.heading,
        description: firstResult.displayText?.description,
        override: passport?.data?.["application.resultOverride.reason"],
      }).reduce((acc, [k, v]) => {
        if (v) acc[k] = v;
        return acc;
      }, {} as Record<string, any>);
    }
  }

  return {
    ...data,
    ...bopsData,
  };
}
