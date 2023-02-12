import { XMLBuilder, XmlBuilderOptions } from "fast-xml-parser";
import type { PartialDeep } from "type-fest";

import { Store } from "../../../../../pages/FlowEditor/lib/store/index";
import { GovUKPayment } from "../../../../../types";
import { Address } from "../../../AddressInput/model";
import { GOV_PAY_PASSPORT_KEY } from "../../../Pay/model";
import { SiteAddress } from "./../../../FindProperty/model";
import { iUniformPayloadSchema, proposalSchema } from "./schema";
import {
  ApplicantOrAgent,
  ExistingUseApplication,
  ExternalAddress,
  FileAttachment,
  IUniformPayload,
  Payment,
  Proposal,
  ProposedUseApplication,
} from "./types";

/**
 * Available values for passport variable "application.type"
 */
export type PlanXAppTypes = "ldc.existing" | "ldc.proposed";

interface UniformPayloadArgs {
  sessionId: string;
  passport: Store.passport;
  files: string[];
  templateNames?: string[] | undefined;
}

export class UniformPayload implements IUniformPayload {
  sessionId: string;
  passport: Store.passport;
  files: string[];
  templateNames: string[];

  proposalCompletionDate: string;
  siteAddress: SiteAddress;

  "portaloneapp:Proposal": Proposal;

  constructor({
    sessionId,
    passport,
    files,
    templateNames,
  }: UniformPayloadArgs) {
    this.sessionId = sessionId;
    this.passport = passport;
    this.files = files;
    this.templateNames = templateNames || [];

    this.proposalCompletionDate = this.setProposalCompletionDate();
    this.siteAddress = passport.data?.["_address"];

    this["portaloneapp:Proposal"] = proposalSchema.parse({
      "portaloneapp:ApplicationHeader": {
        "portaloneapp:ApplicationTo":
          this.passport.data?.["uniform.applicationTo"]?.[0],
        "portaloneapp:DateSubmitted": this.proposalCompletionDate,
        "portaloneapp:RefNum": this.sessionId,
        "portaloneapp:FormattedRefNum": this.sessionId,
        "portaloneapp:Payment": this.getPayment(),
      },
      "portaloneapp:FileAttachments": {
        "common:FileAttachment": [
          ...this.getGeneratedFiles(),
          ...this.getUserUploadedFiles(),
        ],
      },
      "portaloneapp:Applicant": this.getApplicant(),
      "portaloneapp:Agent": this.getAgent(),
      "portaloneapp:SiteLocation": {
        "bs7666:BS7666Address": {
          "bs7666:PAON": {
            "bs7666:Description":
              this.siteAddress?.pao || this.siteAddress?.title,
          },
          "bs7666:StreetDescription": this.siteAddress?.street,
          "bs7666:Town": this.siteAddress?.town,
          "bs7666:PostCode": this.siteAddress?.postcode,
          "bs7666:UniquePropertyReferenceNumber": this.siteAddress?.uprn,
        },
        "common:SiteGridRefence": {
          "bs7666:X": Math.round(this.siteAddress?.x),
          "bs7666:Y": Math.round(this.siteAddress?.y),
        },
      },
      "portaloneapp:ApplicationScenario": {
        "portaloneapp:ScenarioNumber":
          this.passport.data?.["uniform.scenarioNumber"]?.[0],
      },
      "portaloneapp:ConsentRegimes": {
        "portaloneapp:ConsentRegime":
          this.passport.data?.["uniform.consentRegime"]?.[0],
      },
      "portaloneapp:ApplicationData": {
        "portaloneapp:Advice": {
          "common:HaveSoughtAdvice":
            this.passport.data?.["application.preAppAdvice"]?.[0],
        },
        "portaloneapp:SiteVisit": {
          "common:SeeSite": this.passport.data?.["uniform.siteVisit"]?.[0],
          // TODO: Can we just drop this?
          "common:VisitContactDetails": {
            "common:ContactAgent": "",
          },
        },
        "portaloneapp:CertificateLawfulness": this.getCertificateOfLawfulness(),
      },
      "portaloneapp:Declaration": {
        "common:DeclarationDate": this.proposalCompletionDate,
        "common:DeclarationMade":
          this.passport.data?.["application.declaration.accurate"]?.[0],
        "common:Signatory": {
          _PersonRole: this.passport.data?.["uniform.personRole"]?.[0],
        },
      },
      "portaloneapp:DeclarationOfInterest": {
        "common:IsRelated": passport.data?.["uniform.isRelated"]?.[0],
      },
    });
  }

  private getCertificateOfLawfulness = ():
    | ProposedUseApplication
    | ExistingUseApplication => {
    const planXAppType: PlanXAppTypes =
      this.passport.data?.["application.type"]?.[0];
    return planXAppType === "ldc.proposed"
      ? this.getProposedUseApplication()
      : this.getExistingUseApplication();
  };

  // TODO: A lot of duplication here I'm sure we can tidy up
  // Test this once we are confident we have reached feature parity
  private getProposedUseApplication = (): ProposedUseApplication => ({
    "portaloneapp:ProposedUseApplication": {
      "portaloneapp:DescriptionCPU": {
        "common:IsUseChange": this.passport.data?.["uniform.isUseChange"]?.[0],
        "common:ProposedUseDescription":
          this.passport.data?.["proposal.description"],
        "common:ExistingUseDescription":
          this.passport.data?.["proposal.description"],
        "common:IsUseStarted": this.passport.data?.["proposal.started"]?.[0],
      },
      "portaloneapp:GroundsCPU": {
        "common:UseLawfulnessReason":
          this.passport.data?.["proposal.description"],
        "common:SupportingInformation": {
          "common:AdditionalInformation": true,
          "common:Reference": this.passport.data?.["proposal.description"],
        },
        "common:ProposedUseStatus":
          this.passport.data?.["uniform.proposedUseStatus"]?.[0],
        "common:LawfulDevCertificateReason":
          this.passport.data?.["proposal.description"],
      },
    },
  });

  private getExistingUseApplication = (): ExistingUseApplication => ({
    "portaloneapp:ExistingUseApplication": {
      "portaloneapp:DescriptionCEU":
        this.passport.data?.["proposal.description"],
      "portaloneapp:GroundsCEU": {
        "common:CertificateLawfulnessReason":
          this.passport.data?.["proposal.description"],
      },
      "portaloneapp:InformationCEU": {
        "common:UseBegunDate": this.passport.data?.["proposal.started.date"],
      },
    },
  });

  private getApplicant = (): PartialDeep<ApplicantOrAgent> => {
    return this.getApplicantOrAgent("applicant");
  };

  private getAgent = (): PartialDeep<ApplicantOrAgent> | undefined => {
    const isAgentInPassport = Boolean(
      this.passport.data?.["applicant.agent.name.first"]
    );
    if (!isAgentInPassport) return;
    return this.getApplicantOrAgent("applicant.agent");
  };

  private getApplicantOrAgent = (
    person: "applicant.agent" | "applicant"
  ): PartialDeep<ApplicantOrAgent> => {
    return {
      "common:PersonName": {
        "pdt:PersonNameTitle": this.passport.data?.[`${person}.title`],
        "pdt:PersonGivenName": this.passport.data?.[`${person}.name.first`],
        "pdt:PersonFamilyName": this.passport.data?.[`${person}.name.last`],
      },
      "common:OrgName": this.passport.data?.[`${person}.company.name`],
      "common:ContactDetails": {
        "common:Email": {
          "apd:EmailAddress": this.passport.data?.[`${person}.email`],
        },
        "common:Telephone": {
          "apd:TelNationalNumber":
            this.passport.data?.[`${person}.phone.primary`],
        },
      },
      "common:ExternalAddress": this.getAddressForPerson(person),
    };
  };

  private getAddressForPerson = (
    person: "applicant.agent" | "applicant"
  ): ExternalAddress => {
    const address: Address = this.passport.data?.[`${person}.address`];
    if (address)
      return {
        "common:InternationalAddress": {
          "apd:IntAddressLine": [
            address?.line1,
            address?.line2,
            address?.town,
            address?.county,
          ].filter(Boolean) as string[],
          "apd:Country": address?.country,
          "apd:InternationalPostCode": address?.postcode,
        },
      };

    // If we do not have an address for the person, derive one from the SiteAddress which will always be present
    return this.getAddressFromSiteAddress();
  };

  private getAddressFromSiteAddress = (): ExternalAddress => ({
    "common:InternationalAddress": {
      "apd:IntAddressLine": this.siteAddress?.title?.split(", "),
      "apd:InternationalPostCode": this.siteAddress?.postcode,
    },
  });

  private getGeneratedFiles = (): Partial<FileAttachment>[] => {
    // TODO: Test if "N10049" is a required value. Schema suggests that it isn't.
    const files = [
      {
        "common:Identifier": "N10049",
        "common:FileName": "proposal.xml",
        "common:Reference": "Schema XML File",
      },
      {
        "common:FileName": "application.csv",
      },
      {
        "common:FileName": "Overview.htm",
      },
    ];

    if (this.passport.data?.["property.boundary.site"]) {
      files.push({
        "common:FileName": "LocationPlanGeoJSON.geojson",
      });
      files.push({
        "common:FileName": "LocationPlan.htm",
      });
    }

    for (const templateName of this.templateNames) {
      files.push({
        "common:FileName": `${templateName}.doc`,
      });
    }

    return files;
  };

  private getUserUploadedFiles = (): Partial<FileAttachment>[] =>
    this.files.map((file) => {
      const uniqueFilename = decodeURIComponent(
        file.split("/").slice(-2).join("-")
      );
      return {
        "common:FileName": uniqueFilename,
      };
    });

  private setProposalCompletionDate = (): string => {
    // ensure that date is valid and in yyyy-mm-dd format
    let proposalCompletionDate =
      this.passport.data?.["proposal.completion.date"];
    if (proposalCompletionDate) {
      proposalCompletionDate = new Date(proposalCompletionDate)
        .toISOString()
        .split("T")[0];
    } else {
      proposalCompletionDate = new Date(Date.now()).toISOString().split("T")[0];
    }
    return proposalCompletionDate;
  };

  private getPayment = (): Partial<Payment> => {
    const payment = this.passport.data?.[GOV_PAY_PASSPORT_KEY] as GovUKPayment;
    return {
      "common:AmountDue": this.passport.data?.["application.fee.payable"],
      "common:AmountPaid": payment?.amount,
    };
  };

  public buildXML = (): string => {
    const xmlDeclaration = {
      "?xml": {
        _version: "1.0",
        _encoding: "UTF-8",
        _standalone: "yes",
      },
    };
    const validatedProposal = iUniformPayloadSchema.parse({
      "portaloneapp:Proposal": this["portaloneapp:Proposal"],
    });

    const buildOptions: Partial<XmlBuilderOptions> = {
      ignoreAttributes: false,
      attributeNamePrefix: "_",
      format: true,
      suppressEmptyNode: true,
    };
    const builder = new XMLBuilder(buildOptions);

    const xml = builder.build({
      ...xmlDeclaration,
      ...validatedProposal,
    });
    return xml;
  };
}
