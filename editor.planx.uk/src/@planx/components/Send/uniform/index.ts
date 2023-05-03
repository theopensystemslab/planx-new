import omit from "lodash/omit";

import { Store } from "../../../../pages/FlowEditor/lib/store";
import { getBOPSParams } from "../bops";
import { CSVData } from "../model";

export function getUniformParams({
  breadcrumbs,
  flow,
  flowName,
  passport,
  sessionId,
}: {
  breadcrumbs: Store.breadcrumbs;
  flow: Store.flow;
  flowName: string;
  passport: Store.passport;
  sessionId: string;
}) {
  // this is the body we'll POST to the /uniform endpoint - the endpoint will handle file & .zip generation
  return {
    csv: makeCsvData({ breadcrumbs, flow, flowName, passport, sessionId }),
    passport,
    sessionId,
  };
}

// create a CSV data structure based on the payload we send to BOPs
//   (also used in Confirmation component for user-downloadable copy of app data)
export function makeCsvData({
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
}): CSVData {
  const bopsData = getBOPSParams({
    breadcrumbs,
    flow,
    flowName,
    passport,
    sessionId,
  });

  // format dedicated BOPs properties as list of questions & responses to match proposal_details
  //   omitting debug data and keys already in confirmation details
  const summary: any = {
    ...omit(bopsData, ["planx_debug_data", "files", "proposal_details"]),
  };
  const formattedSummary: { question: string; responses: any }[] = [];
  Object.keys(summary).forEach((key) => {
    formattedSummary.push({
      question: key,
      responses: summary[key],
    });
  });

  // similarly format file uploads as list of questions, responses, metadata
  const formattedFiles: {
    question: string;
    responses: any;
    metadata: string;
  }[] = [];
  bopsData["files"]?.forEach((file) => {
    formattedFiles.push({
      question: file.tags
        ? `File upload: ${file.tags.join(", ")}`
        : "File upload",
      responses: file.filename.split("/").pop(),
      metadata: file.applicant_description || "",
    });
  });

  // gather key reference fields, these will be first rows of CSV
  const references: { question: string; responses: any }[] = [
    {
      question: "Planning Application Reference", // match language used on Confirmation page
      responses: sessionId,
    },
    {
      question: "Property Address",
      responses: [
        bopsData.site?.address_1,
        bopsData.site?.address_2,
        bopsData.site?.town,
        bopsData.site?.postcode,
      ]
        .filter(Boolean)
        .join(" ")
        .replaceAll(",", ""), // omit commas for csv > pdf parsing later by Uniform
    },
  ];

  // check if the passport has payment or submission ids, add them as reference rows if exist
  const conditionalKeys = [
    "application.fee.reference.govPay",
    "bopsId",
    "idoxSubmissionId",
  ];
  conditionalKeys.forEach((key) => {
    if (passport.data?.[key]) {
      references.push({
        question: key,
        responses: passport.data?.[key],
      });
    }
  });

  // concat data sections into single list, each object will be row in CSV
  return references
    .concat(formattedSummary)
    .concat(bopsData["proposal_details"] || [])
    .concat(formattedFiles);
}
