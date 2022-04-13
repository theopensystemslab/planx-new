import { GovUKPayment } from "types";

import { Store } from "../../../../pages/FlowEditor/lib/store";
import { GOV_PAY_PASSPORT_KEY } from "../../Pay/model";
import { UniformPayload } from "../model";

export function getUniformParams(passport: Store.passport, sessionId: string) {
  const applicant = passport.data?.applicant;
  const agent = passport.data?.agent;
  const payment = passport.data?.[GOV_PAY_PASSPORT_KEY] as GovUKPayment;

  // Map passport variables to their corresponding XML field
  //   TODO transform JSON to XML later via API endpoitn?
  const data: UniformPayload = {
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

  return data;
}
