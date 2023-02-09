import { XMLBuilder, XmlBuilderOptions } from "fast-xml-parser";

import { Store } from "../../../../../pages/FlowEditor/lib/store/index";
import { GovUKPayment } from "../../../../../types";
import { Address } from "../../../AddressInput/model";
import { GOV_PAY_PASSPORT_KEY } from "../../../Pay/model";
import { SiteAddress } from "./../../../FindProperty/model";
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

interface UniformPayloadRequiredArgs {
  sessionId: string;
  passport: Store.passport;
  files: string[];
  hasBoundary: boolean;
}

export class UniformPayload implements IUniformPayload {
  sessionId: string;
  passport: Store.passport;
  files: string[];
  hasBoundary: boolean;

  proposalCompletionDate: string;
  siteAddress: SiteAddress;

  "portaloneapp:Proposal": Proposal;

  constructor({
    sessionId,
    passport,
    files,
    hasBoundary,
  }: UniformPayloadRequiredArgs) {
    this.sessionId = sessionId;
    this.passport = passport;
    this.files = files;
    this.hasBoundary = hasBoundary;

    this.proposalCompletionDate = this.setProposalCompletionDate();
    this.siteAddress = passport.data?.["_address"];

    this["portaloneapp:Proposal"] = {
      ...this.getNamespaces(),
      _Version: "1.3",
      "portaloneapp:SchemaVersion": 1.3,
      "portaloneapp:ApplicationHeader": {
        "portaloneapp:ApplicationTo":
          this.passport.data?.["uniform.applicationTo"]?.[0],
        "portaloneapp:DateSubmitted": this.proposalCompletionDate,
        "portaloneapp:RefNum": this.sessionId,
        "portaloneapp:FormattedRefNum": this.sessionId,
        "portaloneapp:ApplicationVersion": 1,
        "portaloneapp:AttachmentsChanged": false,
        "portaloneapp:Payment": this.getPayment(),
      },
      "portaloneapp:FileAttachments": {
        "common:FileAttachment": [
          ...this.getGeneratedFiles(),
          ...this.getUserUploadedFiles(),
        ],
      },
      "portaloneapp:Applicant": this.getApplicantOrAgent("applicant"),
      "portaloneapp:Agent": this.getApplicantOrAgent("applicant.agent"),
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
          "bs7666:X": this.siteAddress?.x,
          "bs7666:Y": this.siteAddress?.y,
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
            this.passport.data?.["application.preAppAdvice"],
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
          this.passport.data?.["application.declaration.accurate"],
        "common:Signatory": {
          _PersonRole: this.passport.data?.["uniform.personRole"]?.[0],
        },
      },
      "portaloneapp:DeclarationOfInterest": {
        "common:IsRelated": passport.data?.["uniform.isRelated"]?.[0],
      },
    };
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
        "common:IsUseStarted": this.passport.data?.["proposal.started"],
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

  private getApplicantOrAgent = (
    person: "applicant.agent" | "applicant"
  ): ApplicantOrAgent => ({
    "common:PersonName": {
      "pdt:PersonNameTitle": this.passport.data?.[`${person}.title`],
      "pdt:PersonGivenName": this.passport.data?.[`${person}.name.first`],
      "pdt:PersonFamilyName": this.passport.data?.[`${person}.name.last`],
    },
    "common:OrgName": this.passport.data?.[`${person}.company.name`],
    "common:ContactDetails": {
      "common:Email": {
        "apd:EmailAddress": this.passport.data?.[`${person}.email`],
        _EmailUsage: "work",
        _EmailPreferred: "yes",
      },
      "common:Telephone": {
        "apd:TelNationalNumber":
          this.passport.data?.[`${person}.phone.primary`],
        _TelUse: "work",
        _TelPreferred: "no",
        _TelMobile: "yes",
      },
      _PreferredContactMedium: "E-Mail",
    },
    "common:ExternalAddress": this.getAddressForPerson(person),
  });

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

  private getNamespaces = () => ({
    "_xmlns:portaloneapp":
      "http://www.govtalk.gov.uk/planning/OneAppProposal-2006",
    "_xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "_xmlns:bs7666": "http://www.govtalk.gov.uk/people/bs7666",
    "_xmlns:org": "http://www.govtalk.gov.uk/financial/OrganisationIdentifiers",
    "_xmlns:pdt": "http://www.govtalk.gov.uk/people/PersonDescriptives",
    "_xmlns:apd": "http://www.govtalk.gov.uk/people/AddressAndPersonalDetails",
    "_xmlns:core": "http://www.govtalk.gov.uk/core",
    "_xmlns:common": "http://www.govtalk.gov.uk/planning/OneAppCommon-2006",
  });

  private getGeneratedFiles = (): FileAttachment[] => {
    // TODO: Test if "N10049" is a required value. Schema suggests that it isn't.
    const files = [
      {
        "common:Identifier": "N10049",
        "common:FileName": "proposal.xml",
        "common:Reference": "Schema XML File",
      },
      {
        "common:FileName": "application.csv",
        "common:Reference": "Other",
      },
      {
        "common:FileName": "review.html",
        "common:Reference": "Other",
      },
    ];
    if (this.hasBoundary)
      files.push({
        "common:FileName": "boundary.geojson",
        "common:Reference": "Other",
      });
    return files;
  };

  private getUserUploadedFiles = (): FileAttachment[] =>
    this.files.map((file) => {
      const uniqueFilename = decodeURIComponent(
        file.split("/").slice(-2).join("-")
      );
      return {
        "common:FileName": uniqueFilename,
        "common:Reference": "Other",
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

  private getPayment = (): Payment => {
    const payment = this.passport.data?.[GOV_PAY_PASSPORT_KEY] as GovUKPayment;
    return {
      "common:PaymentMethod": "OnlineViaPortal",
      "common:AmountDue": this.passport.data?.["application.fee.payable"] || 0,
      "common:AmountPaid": payment?.amount || 0,
      "common:Currency": "GBP",
    };
  };

  public buildXML = (): string => {
    const xmlDeclaration = {
      _version: "1.0",
      _encoding: "UTF-8",
      _standalone: "yes",
    };
    const payload = {
      "?xml": xmlDeclaration,
      "portaloneapp:Proposal": this["portaloneapp:Proposal"],
    };
    const buildOptions: Partial<XmlBuilderOptions> = {
      ignoreAttributes: false,
      attributeNamePrefix: "_",
      format: true,
      suppressEmptyNode: true,
    };
    const builder = new XMLBuilder(buildOptions);
    const xml = builder.build(payload);
    return xml;
  };
}
