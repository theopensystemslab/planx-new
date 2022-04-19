import omit from "lodash/omit";
import { GovUKPayment } from "types";

import { Store } from "../../../../pages/FlowEditor/lib/store";
import { PASSPORT_UPLOAD_KEY } from "../../DrawBoundary/model";
import { GOV_PAY_PASSPORT_KEY } from "../../Pay/model";
import { getParams } from "../bops";
import { UniformPayload } from "../model";

export function getUniformParams(
  breadcrumbs: Store.breadcrumbs,
  flow: Store.flow,
  passport: Store.passport,
  sessionId: string
) {
  // Make a list of all S3 URLs for uploaded files
  const fileUrls: string[] = [];
  // get any files uploaded via a FileUpload component
  Object.entries(passport.data || {})
    .filter(([, v]: any) => v?.[0]?.url)
    .forEach(([key, arr]) => {
      (arr as any[]).forEach(({ url }) => {
        try {
          fileUrls.push(url);
        } catch (err) {}
      });
    });

  // additionally get the property boundary file if the user didn't draw
  if (passport?.data?.[PASSPORT_UPLOAD_KEY]) {
    fileUrls.push(passport.data[PASSPORT_UPLOAD_KEY]);
  }

  // this is the body we'll POST to the /uniform endpoint - the endpoint will handle file & .zip generation
  return {
    xml: makeXmlData(passport, sessionId),
    csv: makeCsvData(breadcrumbs, flow, passport, sessionId),
    files: fileUrls,
  };
}

// Map passport variables to their corresponding XML field
function makeXmlData(
  passport: Store.passport,
  sessionId: string
): UniformPayload {
  const applicant = passport.data?.applicant;
  const agent = passport.data?.agent;
  const payment = passport.data?.[GOV_PAY_PASSPORT_KEY] as GovUKPayment;

  return {
    Envelope: {
      "_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "_xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      "_xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
      __prefix: "soap",
      Body: {
        CreateDcApplication: {
          SubmittedDcApplication: {
            ApplicationIdentification: sessionId,
            SiteLocation: {
              Address:
                passport.data?._address?.single_line_address?.replaceAll(
                  ", ",
                  "\n"
                ) || "",
            },
            TypeOfApplication: {
              ApplicationType: "LDC", // hardcode OR passport.data?.application.type ??
              ApplicationType_Text:
                "Lawful Development Certificate submitted via RIPA", // ??
            },
            Proposal: passport.data?.proposal?.description || "",
            ApplicantDetails: {
              ApplicantName:
                [
                  applicant?.title,
                  applicant?.name?.first,
                  applicant?.name?.last,
                ].join(" ") || "",
              ApplicantPhoneNumber: applicant?.phone?.primary || "",
              ApplicantAddress:
                [
                  applicant?.address?.line1,
                  applicant?.address?.line2,
                  applicant?.address?.town,
                  applicant?.address?.county,
                  applicant?.address?.postcode,
                  applicant?.address?.country,
                ].join(", ") || "",
              ApplicantContactDetails: {
                ApplicantContactDetail: {
                  ContactTypeCode: "EMAIL",
                  ContactAddress: applicant?.email || "",
                },
              },
            },
            AgentDetails: {
              AgentName:
                [agent?.title, agent?.name?.first, agent?.name?.last].join(
                  " "
                ) || "",
              AgentPhoneNumber: agent?.phone?.primary || "",
              AgentAddress:
                [
                  agent?.address?.line1,
                  agent?.address?.line2,
                  agent?.address?.town,
                  agent?.address?.county,
                  agent?.address?.postcode,
                  agent?.address?.country,
                ].join(", ") || "",
              AgentContactDetails: {
                AgentContactDetail: {
                  ContactTypeCode: "EMAIL",
                  ContactAddress: agent?.email || "",
                },
              },
            },
            ApplicationFee: {
              FeeAmount: passport?.data?.application?.fee || "",
              PaymentDetails: {
                AmountReceived: payment?.amount.toString() || "",
                PaymentMethod: "ONLINE", // GOV_PAY ??
              },
            },
            ParkingProvision: "",
            ClassifiedRoads: "",
            ResidentialDetails: "",
            FloorspaceDetails: "",
            LandUse: "",
            EmploymentDetails: "",
            ListedBuilding: "",
          },
        },
        __prefix: "soap",
      },
    },
  };
}

// Create a CSV based on the payload structure we send to bops (list of questions/responses/metadata)
function makeCsvData(
  breadcrumbs: Store.breadcrumbs,
  flow: Store.flow,
  passport: Store.passport,
  sessionId: string
): { question: string; responses: any; metadata?: any }[] {
  const bopsData = getParams(breadcrumbs, flow, passport, sessionId);

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

  // concat into single list, each object will be row in CSV
  return formattedSummary
    .concat(bopsData["proposal_details"] || [])
    .concat(formattedFiles);
}
