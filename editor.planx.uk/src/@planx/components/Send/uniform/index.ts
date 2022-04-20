import omit from "lodash/omit";
import { GovUKPayment } from "types";

import { Store } from "../../../../pages/FlowEditor/lib/store";
import { PASSPORT_UPLOAD_KEY } from "../../DrawBoundary/model";
import { GOV_PAY_PASSPORT_KEY } from "../../Pay/model";
import { getParams } from "../bops";
import { CSVData,UniformPayload } from "../model";

export function getUniformParams(
  breadcrumbs: Store.breadcrumbs,
  flow: Store.flow,
  passport: Store.passport,
  sessionId: string
) {
  // make a list of all S3 URLs from uploaded files
  const fileUrls: string[] = [];
  Object.entries(passport.data || {})
    .filter(([, v]: any) => v?.[0]?.url)
    .forEach(([key, arr]) => {
      (arr as any[]).forEach(({ url }) => {
        try {
          // add any files uploaded via a FileUpload component
          fileUrls.push(url);
        } catch (err) {}
      });
    });

  // additionally add the property boundary file if the user didn't draw
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

// map passport variables to their corresponding XML field
//  returns a typed JSON representation of the XML
function makeXmlData(
  passport: Store.passport,
  sessionId: string
): UniformPayload {
  const payment = passport.data?.[GOV_PAY_PASSPORT_KEY] as GovUKPayment;

  return {
    "soap:Envelope": {
      "_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
      "_xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
      "_xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/",
      "soap:Body": {
        CreateDcApplication: {
          SubmittedDcApplication: {
            ApplicationIdentification: sessionId,
            SiteLocation: {
              Address:
                passport.data?.["_address"]?.["single_line_address"] || "", // may need to replace commas with line breaks?
            },
            TypeOfApplication: {
              ApplicationType: passport.data?.["application.type"] || "LDC",
              ApplicationType_Text:
                "Lawful Development Certificate submitted via RIPA", // ??
            },
            Proposal: passport.data?.["proposal.description"] || "",
            ApplicantDetails: {
              ApplicantName:
                [
                  passport.data?.["applicant.title"],
                  passport.data?.["applicant.name.first"],
                  passport.data?.["applicant.name.last"],
                ]
                  .filter(Boolean)
                  .join(" ") || "",
              ApplicantPhoneNumber:
                passport.data?.["applicant.phone.primary"] || "",
              ApplicantAddress:
                [
                  passport.data?.["applicant.address.line1"],
                  passport.data?.["applicant.address.line2"],
                  passport.data?.["applicant.address.town"],
                  passport.data?.["applicant.address.county"],
                  passport.data?.["applicant.address.postcode"],
                  passport.data?.["applicant.address.country"],
                ]
                  .filter(Boolean)
                  .join(", ") || "",
              ApplicantContactDetails: {
                ApplicantContactDetail: {
                  ContactTypeCode: passport.data?.["applicant.email"]
                    ? "EMAIL"
                    : "",
                  ContactAddress: passport.data?.["applicant.email"] || "",
                },
              },
            },
            AgentDetails: {
              AgentName:
                [
                  passport.data?.["agent.title"],
                  passport.data?.["agent.name.first"],
                  passport.data?.["agent.name.last"],
                ]
                  .filter(Boolean)
                  .join(" ") || "",
              AgentPhoneNumber: passport.data?.["agent.phone.primary"] || "",
              AgentAddress:
                [
                  passport.data?.["agent.address.line1"],
                  passport.data?.["agent.address.line2"],
                  passport.data?.["agent.address.town"],
                  passport.data?.["agent.address.county"],
                  passport.data?.["agent.address.postcode"],
                  passport.data?.["agent.address.country"],
                ]
                  .filter(Boolean)
                  .join(", ") || "",
              AgentContactDetails: {
                AgentContactDetail: {
                  ContactTypeCode: passport.data?.["agent.email"]
                    ? "EMAIL"
                    : "",
                  ContactAddress: passport.data?.["agent.email"] || "",
                },
              },
            },
            ApplicationFee: {
              FeeAmount: passport?.data?.["application.fee"] || "",
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
      },
    },
  };
}

// create a CSV data structure based on the payload we send to BOPs
//   (also used in Confirmation component for user-downloadable copy of app data)
export function makeCsvData(
  breadcrumbs: Store.breadcrumbs,
  flow: Store.flow,
  passport: Store.passport,
  sessionId: string
): CSVData {
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
