import { Address } from "@planx/components/AddressInput/model";
import { SiteAddress } from "@planx/components/FindProperty/model";
import { escape } from "lodash";
import { GovUKPayment } from "types";

import { Store } from "../../../../pages/FlowEditor/lib/store";
import { GOV_PAY_PASSPORT_KEY } from "../../Pay/model";

/**
 * Application types in PlanX
 * Value for passport variable "application.type"
 */
export type PlanXAppTypes = "ldc.existing" | "ldc.proposed";

export function makeXmlString({
  passport,
  sessionId,
  files,
  hasBoundary,
}: {
  passport: Store.passport;
  sessionId: string;
  files: string[];
  hasBoundary: boolean;
}) {
  const payment = passport.data?.[GOV_PAY_PASSPORT_KEY] as GovUKPayment;

  // ensure that date is valid and in yyyy-mm-dd format
  let proposalCompletionDate = passport.data?.["proposal.completion.date"];
  if (proposalCompletionDate) {
    proposalCompletionDate = new Date(proposalCompletionDate)
      .toISOString()
      .split("T")[0];
  } else {
    proposalCompletionDate = new Date(Date.now()).toISOString().split("T")[0];
  }

  const siteAddress: SiteAddress = passport.data?.["_address"];

  // format file attachments
  const getRequiredFiles = () => `
    <common:FileAttachment>
      <common:Identifier>N10049</common:Identifier>
      <common:FileName>proposal.xml</common:FileName>
      <common:Reference>Schema XML File</common:Reference>
    </common:FileAttachment>
    <common:FileAttachment>
      <common:FileName>application.csv</common:FileName>
      <common:Reference>Other</common:Reference>
    </common:FileAttachment>
  `;

  const getOptionalFiles = (includeGeoJSON: boolean) => {
    const reviewHTML = `
      <common:FileAttachment>
        <common:FileName>review.html</common:FileName>
        <common:Reference>Other</common:Reference>
      </common:FileAttachment>
    `;
    const boundaryGeoJSON = `
      <common:FileAttachment>
        <common:FileName>boundary.geojson</common:FileName>
        <common:Reference>Other</common:Reference>
      </common:FileAttachment>
    `;
    const allFiles = reviewHTML + boundaryGeoJSON;
    return includeGeoJSON ? allFiles : reviewHTML;
  };

  const getUserUploadedFiles: string[] = [];
  files?.forEach((file) => {
    // We download and add the unique decoded filename to the zip in api.planx.uk/send/uniform, so ensure the schema filename matches
    const uniqueFilename = decodeURIComponent(
      file.split("/").slice(-2).join("-")
    );
    userUploadedFiles.push(`
      <common:FileAttachment>
        <common:FileName>${escape(uniqueFilename)}</common:FileName>
        <common:Reference>Other</common:Reference>
      </common:FileAttachment>
    `);
    });
    return userUploadedFiles.join("");
  };

  const getCertificateOfLawfulness = () => {
    const planXAppType: PlanXAppTypes =
      passport.data?.["application.type"]?.[0];
    if (planXAppType === "ldc.proposed") {
      return `
        <portaloneapp:CertificateLawfulness>
          <portaloneapp:ProposedUseApplication>
            <portaloneapp:DescriptionCPU>
              <common:IsUseChange>${
                passport.data?.["uniform.isUseChange"]?.[0]
              }</common:IsUseChange>
              <common:ProposedUseDescription>${escape(
                passport.data?.["proposal.description"]
              )}</common:ProposedUseDescription>
              <common:ExistingUseDescription>${escape(
                passport.data?.["proposal.description"]
              )}</common:ExistingUseDescription>
              <common:IsUseStarted>${
                passport.data?.["proposal.started"]
              }</common:IsUseStarted>
            </portaloneapp:DescriptionCPU>
            <portaloneapp:GroundsCPU>
              <common:UseLawfulnessReason>${escape(
                passport.data?.["proposal.description"]
              )}</common:UseLawfulnessReason>
              <common:SupportingInformation>
                <common:AdditionalInformation>true</common:AdditionalInformation>
                <common:Reference>${escape(
                  passport.data?.["proposal.description"]
                )}</common:Reference>
              </common:SupportingInformation>
              <common:ProposedUseStatus>${
                passport.data?.["uniform.proposedUseStatus"]?.[0]
              }</common:ProposedUseStatus>
              <common:LawfulDevCertificateReason>${escape(
                passport.data?.["proposal.description"]
              )}</common:LawfulDevCertificateReason>
            </portaloneapp:GroundsCPU>
          </portaloneapp:ProposedUseApplication>
        </portaloneapp:CertificateLawfulness>
      `;
    }
    // ldc.existing is treated as default
    return `
      <portaloneapp:CertificateLawfulness>
        <portaloneapp:ExistingUseApplication>
          <portaloneapp:CategoryCEU/>
          <portaloneapp:DescriptionCEU>${escape(
            passport.data?.["proposal.description"]
          )}</portaloneapp:DescriptionCEU>
          <portaloneapp:GroundsCEU>
            <common:GroundsCategory/>
            <common:CertificateLawfulnessReason>${escape(
              passport.data?.["proposal.description"]
            )}</common:CertificateLawfulnessReason>
          </portaloneapp:GroundsCEU>
          <portaloneapp:InformationCEU>
            <common:UseBegunDate>${
              passport.data?.["proposal.started.date"]
            }</common:UseBegunDate>
          </portaloneapp:InformationCEU>
        </portaloneapp:ExistingUseApplication>
      </portaloneapp:CertificateLawfulness>
    `;
  };

  /**
   * Generate an Address based on a SiteAddress
   */
  const getAddressFromSiteAddress = (): string => {
    const addressLines: string = siteAddress.title
      ?.split(", ")
      .map(
        (addressLine) =>
          `<apd:IntAddressLine>${escape(addressLine)}</apd:IntAddressLine>`
      )
      .join("\n");

    return `
      <common:ExternalAddress>
      <common:InternationalAddress>
        ${addressLines}
        <apd:Country></apd:Country>
        <apd:InternationalPostCode>${escape(
          siteAddress?.postcode
        )}</apd:InternationalPostCode>
      </common:InternationalAddress>
    </common:ExternalAddress>
    `;
  };

  /**
   * Return an InternationalAddress node representing a personal address
   */
  const getAddressForPerson = (
    person: "applicant.agent" | "applicant"
  ): string => {
    const isResident =
      passport.data?.["applicant.resident"]?.[0]?.toLowerCase() === "true";
    // Passports of resident applicants will not have an "application.address" value
    // This must be generated from their siteAddress
    if (person === "applicant" && isResident)
      return getAddressFromSiteAddress();
    const address: Address = passport.data?.[`${person}.address`];
    return `
      <common:ExternalAddress>
        <common:InternationalAddress>
          <apd:IntAddressLine>${escape(address?.line1)}</apd:IntAddressLine>
          <apd:IntAddressLine>${escape(address?.line2)}</apd:IntAddressLine>
          <apd:IntAddressLine>${escape(address?.town)}</apd:IntAddressLine>
          <apd:IntAddressLine>${escape(address?.county)}</apd:IntAddressLine>
          <apd:Country>${escape(address?.country)}</apd:Country>
          <apd:InternationalPostCode>${escape(
            address?.postcode
          )}</apd:InternationalPostCode>
        </common:InternationalAddress>
      </common:ExternalAddress>
    `;
  };

  // this string template represents the full proposal.xml schema including prefixes
  // XML Schema Definitions for reference:
  // -- https://ecab.planningportal.co.uk/uploads/schema/OneAppProposal-v2-0-1.xsd
  // -- https://ecab.planningportal.co.uk/uploads/schema/OneAppCommon/OneAppCommon-2-0-1.xsd
  const proposal = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <portaloneapp:Proposal xmlns:portaloneapp="http://www.govtalk.gov.uk/planning/OneAppProposal-2006" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bs7666="http://www.govtalk.gov.uk/people/bs7666" xmlns:org="http://www.govtalk.gov.uk/financial/OrganisationIdentifiers" xmlns:pdt="http://www.govtalk.gov.uk/people/PersonDescriptives" xmlns:apd="http://www.govtalk.gov.uk/people/AddressAndPersonalDetails" xmlns:core="http://www.govtalk.gov.uk/core" xmlns:common="http://www.govtalk.gov.uk/planning/OneAppCommon-2006" Version="1.3">
      <portaloneapp:SchemaVersion>1.3</portaloneapp:SchemaVersion>
      <portaloneapp:ApplicationHeader>
        <portaloneapp:ApplicationTo>${
          passport.data?.["uniform.applicationTo"]?.[0]
        }</portaloneapp:ApplicationTo>
        <portaloneapp:DateSubmitted>${proposalCompletionDate}</portaloneapp:DateSubmitted>
        <portaloneapp:RefNum>${sessionId}</portaloneapp:RefNum>
        <portaloneapp:FormattedRefNum>${sessionId}</portaloneapp:FormattedRefNum>
        <portaloneapp:ApplicationVersion>1</portaloneapp:ApplicationVersion>
        <portaloneapp:AttachmentsChanged>false</portaloneapp:AttachmentsChanged>
        <portaloneapp:Payment>
          <common:PaymentMethod>OnlineViaPortal</common:PaymentMethod>
          <common:AmountDue>${
            passport.data?.["application.fee.payable"] || 0
          }</common:AmountDue>
          <common:AmountPaid>${payment?.amount || 0}</common:AmountPaid>
          <common:Currency>GBP</common:Currency>
        </portaloneapp:Payment>
      </portaloneapp:ApplicationHeader>
      <portaloneapp:FileAttachments>
        ${getRequiredFiles()}
        ${getOptionalFiles(hasBoundary)}
        ${getUserUploadedFiles()}
      </portaloneapp:FileAttachments>
      <portaloneapp:Applicant>
        <common:PersonName>
          <pdt:PersonNameTitle>${escape(
            passport.data?.["applicant.title"]
          )}</pdt:PersonNameTitle>
          <pdt:PersonGivenName>${escape(
            passport.data?.["applicant.name.first"]
          )}</pdt:PersonGivenName>
          <pdt:PersonFamilyName>${escape(
            passport.data?.["applicant.name.last"]
          )}</pdt:PersonFamilyName>
        </common:PersonName>
        <common:OrgName>${escape(
          passport.data?.["applicant.company.name"]
        )}</common:OrgName>
        ${getAddressForPerson("applicant")}
        <common:ContactDetails PreferredContactMedium="E-Mail">
          <common:Email EmailUsage="work" EmailPreferred="yes">
            <apd:EmailAddress>${
              passport.data?.["applicant.email"]
            }</apd:EmailAddress>
          </common:Email>
          <common:Telephone TelUse="work" TelPreferred="no" TelMobile="yes">
            <apd:TelNationalNumber>${escape(
              passport.data?.["applicant.phone.primary"]
            )}</apd:TelNationalNumber>
          </common:Telephone>
        </common:ContactDetails>
      </portaloneapp:Applicant>
      <portaloneapp:Agent>
        <common:PersonName>
        <pdt:PersonNameTitle>${escape(
          passport.data?.["applicant.agent.title"]
        )}</pdt:PersonNameTitle>
        <pdt:PersonGivenName>${escape(
          passport.data?.["applicant.agent.name.first"]
        )}</pdt:PersonGivenName>
        <pdt:PersonFamilyName>${escape(
          passport.data?.["applicant.agent.name.last"]
        )}</pdt:PersonFamilyName>
        </common:PersonName>
        <common:OrgName>${escape(
          passport.data?.["applicant.agent.company.name"]
        )}</common:OrgName>
        ${getAddressForPerson("applicant.agent")}
        <common:ContactDetails PreferredContactMedium="E-Mail">
          <common:Email EmailUsage="work" EmailPreferred="yes">
            <apd:EmailAddress>${
              passport.data?.["applicant.agent.email"]
            }</apd:EmailAddress>
          </common:Email>
          <common:Telephone TelUse="work" TelPreferred="no" TelMobile="yes">
            <apd:TelNationalNumber>${escape(
              passport.data?.["applicant.agent.phone.primary"]
            )}</apd:TelNationalNumber>
          </common:Telephone>
        </common:ContactDetails>
      </portaloneapp:Agent>
      <portaloneapp:SiteLocation>
        <bs7666:BS7666Address>
          <bs7666:PAON>
            <bs7666:Description>${escape(siteAddress?.pao)}</bs7666:Description>
          </bs7666:PAON>
          <bs7666:StreetDescription>${escape(
            siteAddress?.street
          )}</bs7666:StreetDescription>
          <bs7666:Town>${escape(siteAddress?.town)}</bs7666:Town>
          <bs7666:AdministrativeArea/>
          <bs7666:PostTown/>
          <bs7666:PostCode>${escape(siteAddress?.postcode)}</bs7666:PostCode>
          <bs7666:UniquePropertyReferenceNumber>${
            siteAddress?.uprn
          }</bs7666:UniquePropertyReferenceNumber>
        </bs7666:BS7666Address>
        <common:SiteGridRefence>
          <bs7666:X>${Math.round(siteAddress?.["x"])}</bs7666:X>
          <bs7666:Y>${Math.round(siteAddress?.["y"])}</bs7666:Y>
        </common:SiteGridRefence>
      </portaloneapp:SiteLocation>
      <portaloneapp:ApplicationScenario>
        <portaloneapp:ScenarioNumber>${parseInt(
          passport.data?.["uniform.scenarioNumber"]?.[0]
        )}</portaloneapp:ScenarioNumber>
      </portaloneapp:ApplicationScenario>
      <portaloneapp:ConsentRegimes>
        <portaloneapp:ConsentRegime>${
          passport.data?.["uniform.consentRegime"]?.[0]
        }</portaloneapp:ConsentRegime>
      </portaloneapp:ConsentRegimes>
      <portaloneapp:ApplicationData>
        <portaloneapp:Advice>
          <common:HaveSoughtAdvice>${
            passport.data?.["application.preAppAdvice"]
          }</common:HaveSoughtAdvice>
        </portaloneapp:Advice>
        <portaloneapp:SiteVisit>
          <common:SeeSite>${
            passport.data?.["uniform.siteVisit"]?.[0]
          }</common:SeeSite>
          <common:VisitContactDetails>
            <common:ContactAgent/>
          </common:VisitContactDetails>
        </portaloneapp:SiteVisit>
        ${getCertificateOfLawfulness()}
      </portaloneapp:ApplicationData>
      <portaloneapp:DeclarationOfInterest>
        <common:IsRelated>${
          passport.data?.["uniform.isRelated"]?.[0]
        }</common:IsRelated>
      </portaloneapp:DeclarationOfInterest>
      <portaloneapp:Declaration>
        <common:DeclarationDate>${proposalCompletionDate}</common:DeclarationDate>
        <common:DeclarationMade>${
          passport.data?.["application.declaration.accurate"]
        }</common:DeclarationMade>
        <common:Signatory PersonRole="${
          passport.data?.["uniform.personRole"]?.[0]
        }"/>
      </portaloneapp:Declaration>
    </portaloneapp:Proposal>
  `;

  // If the passport variable is undefined, XML should return an empty field
  return proposal.replaceAll("undefined", "");
}
