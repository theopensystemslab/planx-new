import { GovUKPayment } from "types";

import { Store } from "../../../../pages/FlowEditor/lib/store";
import { GOV_PAY_PASSPORT_KEY } from "../../Pay/model";
import {
  appTypeLookup,
  PlanXAppTypes,
  UniformAppTypes,
} from "./applicationType";

export function makeXmlString(
  passport: Store.passport,
  sessionId: string,
  files: string[]
) {
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

  // format file attachments
  const requiredFiles = `
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

  const userUploadedFiles: string[] = [];
  files?.forEach((file) => {
    userUploadedFiles.push(`
      <common:FileAttachment>
        <common:FileName>${file.split("/").pop()}</common:FileName>
        <common:Reference>Other</common:Reference>
      </common:FileAttachment>
    `);
  });

  const getApplicationType = (): string => {
    const planXAppType: PlanXAppTypes = passport.data?.["application.type"];
    const uniformAppType: UniformAppTypes = appTypeLookup[planXAppType];

    return `
      <portaloneapp:ApplicationScenario>
        <portaloneapp:ScenarioNumber>${uniformAppType.scenarioNumber}</portaloneapp:ScenarioNumber>
      </portaloneapp:ApplicationScenario>
      <portaloneapp:ConsentRegimes>
        <portaloneapp:ConsentRegime>${uniformAppType.consentRegime}</portaloneapp:ConsentRegime>
      </portaloneapp:ConsentRegimes>
    `;
  };

  // this string template represents the full proposal.xml schema including prefixes
  const proposal = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <portaloneapp:Proposal xmlns:portaloneapp="http://www.govtalk.gov.uk/planning/OneAppProposal-2006" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bs7666="http://www.govtalk.gov.uk/people/bs7666" xmlns:org="http://www.govtalk.gov.uk/financial/OrganisationIdentifiers" xmlns:pdt="http://www.govtalk.gov.uk/people/PersonDescriptives" xmlns:apd="http://www.govtalk.gov.uk/people/AddressAndPersonalDetails" xmlns:core="http://www.govtalk.gov.uk/core" xmlns:common="http://www.govtalk.gov.uk/planning/OneAppCommon-2006" Version="1.3">
      <portaloneapp:SchemaVersion>1.3</portaloneapp:SchemaVersion>
      <portaloneapp:ApplicationHeader>
        ${/* TODO: Each team has a unique value for this */ ""}
        <portaloneapp:ApplicationTo>00QA</portaloneapp:ApplicationTo>
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
        ${requiredFiles}
        ${userUploadedFiles.join("")}
      </portaloneapp:FileAttachments>
      <portaloneapp:Applicant>
        <common:PersonName>
          <pdt:PersonNameTitle>${
            passport.data?.["applicant.title"]
          }</pdt:PersonNameTitle>
          <pdt:PersonGivenName>${
            passport.data?.["applicant.name.first"]
          }</pdt:PersonGivenName>
          <pdt:PersonFamilyName>${
            passport.data?.["applicant.name.last"]
          }</pdt:PersonFamilyName>
        </common:PersonName>
        <common:OrgName>${
          passport.data?.["applicant.company.name"]
        }</common:OrgName>
        <common:ExternalAddress>
          <common:InternationalAddress>
            <apd:IntAddressLine>${
              passport.data?.["applicant.address.line1"]
            }</apd:IntAddressLine>
            <apd:IntAddressLine>${
              passport.data?.["applicant.address.line2"]
            }</apd:IntAddressLine>
            <apd:IntAddressLine>${
              passport.data?.["applicant.address.town"]
            }</apd:IntAddressLine>
            <apd:IntAddressLine>${
              passport.data?.["applicant.address.county"]
            }</apd:IntAddressLine>
            <apd:Country>${
              passport.data?.["applicant.address.country"]
            }</apd:Country>
            <apd:InternationalPostCode>${
              passport.data?.["applicant.address.postcode"]
            }</apd:InternationalPostCode>
          </common:InternationalAddress>
        </common:ExternalAddress>
        <common:ContactDetails PreferredContactMedium="E-Mail">
          <common:Email EmailUsage="work" EmailPreferred="yes">
            <apd:EmailAddress>${
              passport.data?.["applicant.email"]
            }</apd:EmailAddress>
          </common:Email>
          <common:Telephone TelUse="work" TelPreferred="no" TelMobile="yes">
            <apd:TelNationalNumber>${
              passport.data?.["applicant.phone.primary"]
            }</apd:TelNationalNumber>
          </common:Telephone>
        </common:ContactDetails>
      </portaloneapp:Applicant>
      <portaloneapp:Agent>
        <common:PersonName>
        <pdt:PersonNameTitle>${
          passport.data?.["applicant.agent.title"]
        }</pdt:PersonNameTitle>
        <pdt:PersonGivenName>${
          passport.data?.["applicant.agent.name.first"]
        }</pdt:PersonGivenName>
        <pdt:PersonFamilyName>${
          passport.data?.["applicant.agent.name.last"]
        }</pdt:PersonFamilyName>
        </common:PersonName>
        <common:OrgName>${
          passport.data?.["applicant.agent.company.name"]
        }</common:OrgName>
        <common:ExternalAddress>
          <common:InternationalAddress>
          <apd:IntAddressLine>${
            passport.data?.["applicant.agent.address.line1"]
          }</apd:IntAddressLine>
          <apd:IntAddressLine>${
            passport.data?.["applicant.agent.address.line2"]
          }</apd:IntAddressLine>
          <apd:IntAddressLine>${
            passport.data?.["applicant.agent.address.town"]
          }</apd:IntAddressLine>
          <apd:IntAddressLine>${
            passport.data?.["applicant.agent.address.county"]
          }</apd:IntAddressLine>
          <apd:Country>${
            passport.data?.["applicant.agent.address.country"]
          }</apd:Country>
          <apd:InternationalPostCode>${
            passport.data?.["applicant.agent.address.postcode"]
          }</apd:InternationalPostCode>
          </common:InternationalAddress>
        </common:ExternalAddress>
        <common:ContactDetails PreferredContactMedium="E-Mail">
          <common:Email EmailUsage="work" EmailPreferred="yes">
            <apd:EmailAddress>${
              passport.data?.["applicant.agent.email"]
            }</apd:EmailAddress>
          </common:Email>
          <common:Telephone TelUse="work" TelPreferred="no" TelMobile="yes">
            <apd:TelNationalNumber>${
              passport.data?.["applicant.agent.phone.primary"]
            }</apd:TelNationalNumber>
          </common:Telephone>
        </common:ContactDetails>
      </portaloneapp:Agent>
      <portaloneapp:SiteLocation>
        <bs7666:BS7666Address>
          <bs7666:PAON>
            <bs7666:Description>${
              passport.data?.["_address"]?.["planx_description"]
            }</bs7666:Description>
          </bs7666:PAON>
          <bs7666:StreetDescription>${
            passport.data?.["_address"]?.["title"]
          }</bs7666:StreetDescription>
          <bs7666:Town>${passport.data?.["_address"]?.["town"]}</bs7666:Town>
          <bs7666:AdministrativeArea>${passport.data?.[
            "property.localAuthorityDistrict"
          ]?.join(", ")}</bs7666:AdministrativeArea>
          <bs7666:PostTown>${
            passport.data?.["_address"]?.["town"]
          }</bs7666:PostTown>
          <bs7666:PostCode>${
            passport.data?.["_address"]?.["postcode"]
          }</bs7666:PostCode>
          <bs7666:UniquePropertyReferenceNumber>${
            passport.data?.["_address"]?.["uprn"]
          }</bs7666:UniquePropertyReferenceNumber>
        </bs7666:BS7666Address>
        <common:SiteGridRefence>
          <bs7666:X>${passport.data?.["_address"]?.["x"]}</bs7666:X>
          <bs7666:Y>${passport.data?.["_address"]?.["y"]}</bs7666:Y>
        </common:SiteGridRefence>
      </portaloneapp:SiteLocation>
      ${getApplicationType()}
      <portaloneapp:ApplicationData>
        ${
          /* TODO: Is this pre-application advice? application.preAppAdvice */ ""
        }
        <portaloneapp:Advice>
          <common:HaveSoughtAdvice>0</common:HaveSoughtAdvice>
        </portaloneapp:Advice>
        <portaloneapp:SiteVisit>
          <common:SeeSite>false</common:SeeSite>
          <common:VisitContactDetails>
            <common:ContactAgent/>
          </common:VisitContactDetails>
        </portaloneapp:SiteVisit>
        <portaloneapp:Biodiversity>
          <common:ProtectedPrioritySpecies/>
          <common:DesignatedSites/>
          <common:GeologicalConservationImportance/>
          <common:InvolvesDemolitionOfBuilding>false</common:InvolvesDemolitionOfBuilding>
          <common:InvolvesAlterationsOrEnlargement>false</common:InvolvesAlterationsOrEnlargement>
          <common:InvolvesLossOfTreesOrHedges>false</common:InvolvesLossOfTreesOrHedges>
        </portaloneapp:Biodiversity>
        <portaloneapp:CertificateLawfulness>
          <portaloneapp:ProposedUseApplication>
            <portaloneapp:DescriptionCPU>
              <common:IsProposedOperationBuilding>true</common:IsProposedOperationBuilding>
              <common:OperationsDescription/>
              <common:IsUseChange>true</common:IsUseChange>
              <common:ProposedUseDescription>${
                passport.data?.["proposal.description"]
              }</common:ProposedUseDescription>
              <common:ExistingUseDescription>${
                passport.data?.["proposal.description"]
              }</common:ExistingUseDescription>
              <common:IsUseStarted>true</common:IsUseStarted>
            </portaloneapp:DescriptionCPU>
            <portaloneapp:GroundsCPU>
              <common:UseLawfulnessReason/>
              <common:SupportingInformation>
                <common:AdditionalInformation>true</common:AdditionalInformation>
                <common:Reference/>
              </common:SupportingInformation>
              <common:ExistingUse>
                <common:A1/>
              </common:ExistingUse>
              <common:ProposedUse>
                <common:A1/>
              </common:ProposedUse>
              <common:ProposedUseStatus>permanent</common:ProposedUseStatus>
              <common:LawfulDevCertificateReason/>
            </portaloneapp:GroundsCPU>
          </portaloneapp:ProposedUseApplication>
          ${/* TODO: Should applicant.interest be referenced here?  */ ""}
          <portaloneapp:Interest>
            <common:ApplicantInterest>
              <common:Owner>true</common:Owner>
              <common:Lessee>false</common:Lessee>
              <common:Occupier>false</common:Occupier>
            </common:ApplicantInterest>
          </portaloneapp:Interest>
        </portaloneapp:CertificateLawfulness>
      </portaloneapp:ApplicationData>
      ${
        /* TODO: Should application.declaration.connection be reference here? */ ""
      }
      <portaloneapp:DeclarationOfInterest>
        <common:IsRelated>o</common:IsRelated>
      </portaloneapp:DeclarationOfInterest>
      <portaloneapp:Declaration>
        <common:DeclarationDate>${proposalCompletionDate}</common:DeclarationDate>
        <common:DeclarationMade>${
          passport.data?.["application.declaration.accurate"]
        }</common:DeclarationMade>
        <common:Signatory PersonRole="Agent"/>
      </portaloneapp:Declaration>
    </portaloneapp:Proposal>
  `;

  // If the passport variable is undefined, XML should return an empty field
  return proposal.replaceAll("undefined", "");
}
