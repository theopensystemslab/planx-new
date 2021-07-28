// API Documentation: https://ripa.bops.services/api-docs/index.html

// minimumPayload and fullPayload are the minimum and full expected
// POST data payloads accepted by the BOPS API, see:
// https://southwark.preview.bops.services/api-docs/index.html

import { airbrake } from "airbrake";
import { flatFlags } from "pages/FlowEditor/data/flags";
import { getResultData } from "pages/FlowEditor/lib/store/preview";
import { GovUKPayment } from "types";

import { Store } from "../../../pages/FlowEditor/lib/store";
import { PASSPORT_UPLOAD_KEY } from "../DrawBoundary/model";
import { GOV_PAY_PASSPORT_KEY, toPence } from "../Pay/model";
import { removeNilValues } from "../shared/utils";
import { TYPES } from "../types";
import {
  BOPS_TAGS,
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

function isTypeForBopsPayload(type?: TYPES) {
  if (!type) return false;

  switch (type) {
    case TYPES.Calculate:
    case TYPES.Confirmation:
    case TYPES.Content:
    case TYPES.DrawBoundary:
    case TYPES.ExternalPortal:
    case TYPES.FileUpload:
    case TYPES.Filter:
    case TYPES.FindProperty:
    case TYPES.Flow:
    case TYPES.InternalPortal:
    case TYPES.Notice:
    case TYPES.Notify:
    case TYPES.Page:
    case TYPES.Pay:
    case TYPES.Response:
    case TYPES.Result:
    case TYPES.Review:
    case TYPES.Send:
    case TYPES.SetValue:
    case TYPES.TaskList:
      return false;

    case TYPES.AddressInput:
    case TYPES.Checklist:
    case TYPES.DateInput:
    case TYPES.NumberInput:
    case TYPES.Statement:
    case TYPES.TextInput:
      return true;

    default:
      const exhaustiveCheck: never = type;
      throw new Error(`Unhandled type: ${type}`);
  }
}

export const makePayload = (flow: Store.flow, breadcrumbs: Store.breadcrumbs) =>
  Object.entries(breadcrumbs)
    .filter(([id]) => {
      const validType = isTypeForBopsPayload(flow[id].type);
      // exclude answers that have been extracted into the root object
      const validKey = !Object.values(bopsDictionary).includes(
        flow[id]?.data?.fn
      );

      return validType && validKey;
    })
    .map(([id, bc]) => {
      const { edges = [], ...question } = flow[id];

      const answers: Array<string> = (() => {
        switch (flow[id].type) {
          case TYPES.AddressInput:
            try {
              const addressObject = Object.values(bc.data!).find(
                (x) => x.postcode
              );
              return [Object.values(addressObject).join(", ")];
            } catch (err) {
              return [JSON.stringify(bc.data)];
            }
          case TYPES.DateInput:
          case TYPES.NumberInput:
          case TYPES.TextInput:
            return Object.values(bc.data ?? {}).map((x) => String(x));
          case TYPES.Checklist:
          case TYPES.Statement:
          default:
            return bc.answers ?? [];
        }
      })();

      const responses = answers.map((id) => {
        let value = id;
        const metadata: ResponseMetaData = {};

        if (flow[id]) {
          // XXX: this is how we get the text represenation of a node until
          //      we have a more standardised way of retrieving it. More info
          //      https://github.com/theopensystemslab/planx-new/discussions/386
          value = flow[id].data?.text ?? flow[id].data?.title ?? "";

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
        question: question?.data?.text ?? question?.data?.title ?? "",
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

  // XXX: Hardcode application type for now
  data.application_type = "lawfulness_certificate";

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
    .forEach(([key, arr]) => {
      (arr as any[]).forEach(({ url }) => {
        try {
          data.files = data.files || [];

          data.files.push({
            filename: url,
            tags: extractTagsFromPassportKey(key),
          });
        } catch (err) {}
      });
    });

  // 2a. property boundary file if the user didn't draw

  if (passport?.data?.[PASSPORT_UPLOAD_KEY]) {
    data.files = data.files || [];
    data.files.push({
      filename: passport.data[PASSPORT_UPLOAD_KEY],
      tags: extractTagsFromPassportKey(PASSPORT_UPLOAD_KEY),
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
  const workStatus = getWorkStatus(passport);
  if (workStatus) data.work_status = workStatus;

  // 5. keys

  const bopsData = removeNilValues(
    Object.entries(bopsDictionary).reduce((acc, [bopsField, planxField]) => {
      acc[bopsField as keyof BOPSFullPayload] = passport.data?.[planxField];
      return acc;
    }, {} as Partial<BOPSFullPayload>)
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

  try {
    const result = getResultData(breadcrumbs, flow);
    const { flag } = Object.values(result)[0];
    data.result = removeNilValues({
      flag: [flag.category, flag.text].join(" / "),
      heading: flag.text,
      description: flag.officerExplanation,
      override: passport?.data?.["application.resultOverride.reason"],
    });
  } catch (err) {
    console.error("unable to get flag result", err);
    airbrake?.notify(err);
  }

  return {
    ...data,
    ...bopsData,
    planx_debug_data: {
      session_id: sessionId,
      breadcrumbs,
      passport,
    },
  };
}

export const getWorkStatus = (passport: Store.passport) => {
  // XXX: this is currently probably a [string], but will be string soon
  //      howver, String(string) === string and String([string]) === string
  switch (String(passport?.data?.["application.type"])) {
    case "ldc.existing":
      return "existing";
    case "ldc.proposed":
      return "proposed";
  }
};

/**
 * Accepts a passport key and returns BOPS file tags associated with it
 * More info: https://bit.ly/tags-spreadsheet
 */
export const extractTagsFromPassportKey = (passportKey: string) => {
  const tags: BOPS_TAGS[] = [];

  if (!passportKey) return tags;

  const splitKey = passportKey.split(".");

  if (splitKey[0] === "proposal") {
    tags.push(BOPS_TAGS.Proposed);
  } else if (splitKey[0] === "property") {
    tags.push(BOPS_TAGS.Existing);
  }

  if (splitKey.includes("sitePlan")) {
    tags.push(BOPS_TAGS.Site);
    tags.push(BOPS_TAGS.Plan);
  } else if (splitKey.includes("roofPlan")) {
    tags.push(BOPS_TAGS.Roof);
    tags.push(BOPS_TAGS.Plan);
  } else if (splitKey.includes("elevation")) {
    tags.push(BOPS_TAGS.Elevation);
    tags.push(BOPS_TAGS.Plan);
  } else if (splitKey.includes("section")) {
    tags.push(BOPS_TAGS.Section);
    tags.push(BOPS_TAGS.Plan);
  } else if (splitKey.includes("locationPlan")) {
    // XXX: no Location-related tag provided by BOPS
    tags.push(BOPS_TAGS.Plan);
  } else if (splitKey.includes("plan")) {
    tags.push(BOPS_TAGS.Floor);
    tags.push(BOPS_TAGS.Plan);
  }

  return tags;
};
