// API Documentation: https://ripa.bops.services/api-docs/index.html

// minimumPayload and fullPayload are the minimum and full expected
// POST data payloads accepted by the BOPS API, see:
// https://southwark.preview.bops.services/api-docs/index.html

import {
  flatFlags,
  GOV_PAY_PASSPORT_KEY,
  GovUKPayment,
} from "@opensystemslab/planx-core/types";
import { logger } from "airbrake";
import { isEmpty } from "lodash";
import { useStore } from "pages/FlowEditor/lib/store";
import { getResultData } from "pages/FlowEditor/lib/store/preview";

import { Store } from "../../../../pages/FlowEditor/lib/store";
import { toPence } from "../../Pay/model";
import { removeNilValues } from "../../shared/utils";
import { TYPES } from "../../types";
import { findGeoJSON } from "../helpers";
import {
  BOPSFullPayload,
  FileTag,
  QuestionAndResponses,
  QuestionMetaData,
  Response,
  ResponseMetaData,
  USER_ROLES,
} from "../model";

export const bopsDictionary = {
  // applicant or agent details provided via TextInput(s) or ContactInput component
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

function exhaustiveCheck(type: never): never {
  throw new Error(`Unhandled type: ${type}`);
}

function isTypeForBopsPayload(type?: TYPES) {
  if (!type) return false;

  switch (type) {
    case TYPES.Calculate:
    case TYPES.Confirmation:
    case TYPES.Content:
    case TYPES.DrawBoundary:
    case TYPES.ExternalPortal:
    case TYPES.FileUpload:
    case TYPES.FileUploadAndLabel:
    case TYPES.Filter:
    case TYPES.FindProperty:
    case TYPES.Flow:
    case TYPES.InternalPortal:
    case TYPES.NextSteps:
    case TYPES.Notice:
    case TYPES.Pay:
    case TYPES.PlanningConstraints:
    case TYPES.PropertyInformation:
    case TYPES.Response:
    case TYPES.Result:
    case TYPES.Review:
    case TYPES.Section:
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
    case TYPES.ContactInput:
      return true;

    default:
      return exhaustiveCheck(type);
  }
}

// For a given node (a "Question"), recursively scan the flow schema to find which portal it belongs to
//   and add the portal_name to the QuestionMetadata so BOPS can group proposal_details
const addPortalName = (
  id: string,
  flow: Store.flow,
  metadata: QuestionMetaData,
): QuestionMetaData => {
  if (id === "_root") {
    metadata.portal_name = "_root";
  } else if (flow[id]?.type === 300) {
    // internal & external portals are both type 300 after flattening (ref dataMergedHotFix)
    metadata.portal_name = flow[id]?.data?.text || id;
  } else {
    // if the current node id is not the root or a portal, then find its' next parent node and so on until we hit a portal
    Object.entries(flow).forEach(([nodeId, node]) => {
      if (node.edges?.includes(id)) {
        addPortalName(nodeId, flow, metadata);
      }
    });
  }

  return metadata;
};

const addSectionName = (
  id: string,
  metadata: QuestionMetaData,
): QuestionMetaData => {
  const { hasSections, getSectionForNode } = useStore.getState();
  if (hasSections) {
    const section = getSectionForNode(id);
    if (section?.data?.title) metadata.section_name = section.data.title;
  }
  return metadata;
};

export const makePayload = (
  flow: Store.flow,
  breadcrumbs: Store.breadcrumbs,
) => {
  const feedback: BOPSFullPayload["feedback"] = {};

  const proposal_details = Object.entries(breadcrumbs)
    .map(([id, bc]) => {
      // Skip nodes that may be in the breadcrumbs which are no longer in flow
      if (!flow[id]) return;
      const { edges = [], ...question } = flow[id];

      try {
        const trimmedFeedback = bc.feedback?.trim();
        if (trimmedFeedback) {
          switch (flow[id].type) {
            case TYPES.Result:
              feedback["result"] = trimmedFeedback;
              break;
            case TYPES.FindProperty:
              feedback["find_property"] = trimmedFeedback;
              break;
            case TYPES.PlanningConstraints:
              feedback["planning_constraints"] = trimmedFeedback;
              break;
            default:
              throw new Error(`invalid feedback type ${flow[id].type}`);
          }
        }
      } catch (err) {
        logger.notify(err);
      }

      // exclude answers that have been extracted into the root object
      const validKey = !Object.values(bopsDictionary).includes(
        flow[id]?.data?.fn,
      );
      if (!isTypeForBopsPayload(flow[id]?.type) || !validKey) return;

      const answers: Array<string> = (() => {
        switch (flow[id].type) {
          case TYPES.AddressInput:
            try {
              const addressObject = Object.values(bc.data!).find(
                (x) => x.postcode,
              );
              return [Object.values(addressObject).join(", ")];
            } catch (err) {
              return [JSON.stringify(bc.data)];
            }
          case TYPES.ContactInput:
            try {
              // skip returning internal _contact data object, just return main key values
              const contactObject = Object.values(bc.data!).filter(
                (x) => typeof x === "string",
              );
              return [Object.values(contactObject).join(" ")];
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
          // XXX: this is how we get the text representation of a node until
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

      let metadata: QuestionMetaData = {};
      if (bc.auto) metadata.auto_answered = true;
      if (flow[id]?.data?.policyRef) {
        metadata.policy_refs = [
          // remove html tags
          { text: flow[id].data.policyRef.replace(/<[^>]*>/g, "").trim() },
        ];
      }
      metadata = addPortalName(id, flow, metadata);
      metadata = addSectionName(id, metadata);

      if (Object.keys(metadata).length > 0) ob.metadata = metadata;

      return ob;
    })
    .filter(Boolean) as Array<QuestionAndResponses>;

  return { proposal_details, feedback };
};

export function getBOPSParams({
  breadcrumbs,
  flow,
  passport,
  sessionId,
  flowName,
}: {
  breadcrumbs: Store.breadcrumbs;
  flow: Store.flow;
  passport: Store.passport;
  sessionId: string;
  flowName: string;
}) {
  const data = {} as BOPSFullPayload;

  // Default application type accepted by BOPS
  data.application_type = "lawfulness_certificate";

  // Overwrite application type if this isn't an LDC (relies on LDC flows having consistent slug)
  //   eg because makeCsvData which is used across services calls this method
  if (flowName && flowName !== "Apply for a lawful development certificate") {
    data.application_type = flowName;
  }

  // 1a. address

  const address = passport.data?._address;

  if (address) {
    const site = {} as BOPSFullPayload["site"];

    site.uprn = address.uprn && String(address.uprn);

    site.address_1 =
      address.single_line_address?.split(`, ${address.town}`)[0] ||
      address.title;

    site.town =
      address.town ||
      passport.data?.["property.localAuthorityDistrict"]?.join(", ");
    site.postcode = address.postcode;

    site.latitude = address.latitude;
    site.longitude = address.longitude;

    site.x = address.x;
    site.y = address.y;

    site.source = address.source; // reflects "os" or "proposed"

    data.site = site;
  }

  // 1b. property boundary
  const geojson = findGeoJSON(flow, breadcrumbs);
  if (geojson) data.boundary_geojson = geojson;

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
            applicant_description: extractFileDescriptionForPassportKey(
              passport.data,
              key,
            ),
          });
        } catch (err) {}
      });
    });

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

  // 3a. constraints that we checked, but do not intersect/apply to the property

  const nots = (
    passport.data?.["_nots"]?.["property.constraints.planning"] || []
  ).reduce((acc: Record<string, boolean>, curr: string) => {
    acc[curr] = false;
    return acc;
  }, {});
  if (Object.keys(nots).map(Boolean).length > 0) {
    data.constraints = { ...data.constraints, ...nots };
  }

  // 4. work status
  const workStatus = getWorkStatus(passport);
  if (workStatus) data.work_status = workStatus;

  // 5. keys

  const bopsData = removeNilValues(
    Object.entries(bopsDictionary).reduce((acc, [bopsField, planxField]) => {
      acc[bopsField as keyof BOPSFullPayload] = passport.data?.[planxField];
      return acc;
    }, {} as Partial<BOPSFullPayload>),
  );

  // 6a. questions+answers array
  const { proposal_details, feedback } = makePayload(flow, breadcrumbs);

  data.proposal_details = proposal_details;

  // 6b. optional feedback object
  // we include feedback object if it contains at least 1 key/value pair
  if (Object.keys(feedback).length > 0) {
    data.feedback = feedback;
  }

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
      description: flag.description,
      override: passport?.data?.["application.resultOverride.reason"],
    });
  } catch (err) {
    console.error("unable to get flag result");
    logger.notify(err);
  }

  // 9. user role

  // XXX: toString() is a 'hack' until passport data is better structured.
  //      Currently values might be [string] or string, depending on Q type.
  //      This will extract a [string] into a string and not do anything if
  //      the value is already a string, for example -
  //
  //      passport.data['user.role']= ["applicant"]
  //      const userRole = passport.data['user.role'].toString()
  //      userRole === "applicant"

  const userRole = passport?.data?.["user.role"]?.toString();

  if (userRole && USER_ROLES.includes(userRole)) data.user_role = userRole;

  // 10. Works
  const works: BOPSFullPayload["works"] = {};

  const startedDate = parseDate(passport?.data?.["proposal.start.date"]);
  if (startedDate) works.start_date = startedDate;

  const completionDate = parseDate(
    passport?.data?.["proposal.completion.date"],
  );
  if (completionDate) works.finish_date = completionDate;

  if (!isEmpty(works)) data.works = works;

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

const parseDate = (dateString: string | undefined): string | undefined => {
  try {
    if (dateString) {
      // ensure that date is valid and in yyyy-mm-dd format
      return new Date(dateString).toISOString().split("T")[0];
    }
  } catch (err) {
    const errPayload = ["Unable to parse date", { dateString, err }];
    logger.notify(errPayload);
  }
};

export const getWorkStatus = (passport: Store.passport) => {
  // XXX: toString() is explained in XXX block above
  switch (passport?.data?.["application.type"]?.toString()) {
    case "ldc.existing":
      return "existing";
    case "ldc.proposed":
      return "proposed";
  }
};

const extractFileDescriptionForPassportKey = (
  passport: Store.passport["data"],
  passportKey: string,
): string | undefined => {
  try {
    // XXX: check for .description or .reason as there might be either atm
    //      i.e. file = property.photograph, text = property.photograph.reason
    for (const x of ["description", "reason"]) {
      const key = `${passportKey}.${x}`;
      const val = passport?.[key];
      if (val && typeof val === "string") {
        return val;
      }
    }
  } catch (_err) {}
  return undefined;
};

/**
 * Accepts a passport key and returns BOPS file tags associated with it
 * More info: https://bit.ly/tags-spreadsheet
 */
export const extractTagsFromPassportKey = (passportKey: string) => {
  const tags: FileTag[] = [];

  if (!passportKey) return tags;

  const splitKey = passportKey.split(".");

  if (splitKey[0] === "proposal") {
    tags.push("Proposed");
  } else if (splitKey[0] === "property") {
    tags.push("Existing");
  }

  if (splitKey.includes("locationPlan")) {
    // "locationPlan" is DrawBoundary's passport key
    tags.push("Site");
    tags.push("Plan");
  } else if (splitKey.includes("roofPlan")) {
    tags.push("Roof");
    tags.push("Plan");
  } else if (splitKey.includes("elevation")) {
    tags.push("Elevation");
  } else if (splitKey.includes("photograph")) {
    tags.push("Photograph");
  } else if (splitKey.includes("section")) {
    tags.push("Section");
  } else if (splitKey.includes("floorPlan")) {
    tags.push("Floor");
    tags.push("Plan");
  } else if (splitKey.includes("councilTaxBill")) {
    tags.push("Council Tax Document");
  } else if (splitKey.includes("tenancyAgreement")) {
    tags.push("Tenancy Agreement");
  } else if (splitKey.includes("tenancyInvoice")) {
    tags.push("Tenancy Invoice");
  } else if (splitKey.includes("bankStatement")) {
    tags.push("Bank Statement");
  } else if (splitKey.includes("declaration")) {
    tags.push("Statutory Declaration");
  } else if (passportKey.includes("utility.bill")) {
    tags.push("Utility Bill");
  } else if (passportKey.includes("buildingControl.certificate")) {
    tags.push("Building Control Certificate");
  } else if (passportKey.includes("construction.invoice")) {
    tags.push("Construction Invoice");
  } else if (splitKey.some((x) => x.endsWith("Plan"))) {
    // eg "sitePlan"
    tags.push("Plan");
  } else if (splitKey.includes("other")) {
    tags.push("Other");
  }

  return tags;
};
