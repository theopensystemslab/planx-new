import omit from "lodash/omit";
import { GovUKPayment } from "types";

import { Store } from "../../../../pages/FlowEditor/lib/store";
import { GOV_PAY_PASSPORT_KEY } from "../../Pay/model";
import { getParams } from "../bops";
import { CSVData, UniformPayload } from "../model";

export function getUniformParams(
  breadcrumbs: Store.breadcrumbs,
  flow: Store.flow,
  passport: Store.passport,
  sessionId: string
) {
  // make a list of all S3 URLs & filenames from uploaded files
  const files: { url: string; name: string }[] = [];
  Object.entries(passport.data || {})
    // add any files uploaded via a FileUpload component
    .filter(([, v]: any) => v?.[0]?.url)
    .forEach(([key, arr]) => {
      (arr as any[]).forEach(({ url, filename }) => {
        try {
          files.push({ url: url, name: filename });
        } catch (err) {}
      });
    });

  // additionally add the property boundary file if the user didn't draw
  if (passport?.data?.["property.uploadedFile"]) {
    const boundaryFile = passport.data["property.uploadedFile"];
    files.push({ url: boundaryFile.url, name: boundaryFile.file.path });
  }

  // applicants may upload the same file in multiple slots,
  //  but we only want to send a single copy of each file to Uniform
  const uniqueFiles: string[] = [];
  const uniqueFileNames: string[] = [];
  files.forEach((file) => {
    if (!uniqueFileNames.includes(file.name)) {
      uniqueFileNames.push(file.name);
      uniqueFiles.push(file.url);
    }
  });

  // this is the body we'll POST to the /uniform endpoint - the endpoint will handle file & .zip generation
  return {
    xml: makeXmlData(passport, sessionId),
    csv: makeCsvData(breadcrumbs, flow, passport, sessionId),
    files: uniqueFiles,
    sessionId,
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
    _declaration: {
      _attributes: {
        version: "1.0",
        encoding: "utf-8",
      },
    },
    Envelope: {
      Body: {
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
