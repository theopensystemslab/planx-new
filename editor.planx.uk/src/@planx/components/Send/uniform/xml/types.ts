export interface IUniformPayload {
  "portaloneapp:Proposal": Proposal;
}

export interface Proposal {
  "portaloneapp:SchemaVersion": number;
  "portaloneapp:ApplicationHeader": ApplicationHeader;
  "portaloneapp:FileAttachments": FileAttachments;
  "portaloneapp:Applicant": ApplicantOrAgent;
  "portaloneapp:Agent": ApplicantOrAgent;
  "portaloneapp:SiteLocation": SiteLocation;
  "portaloneapp:ApplicationScenario": ApplicationScenario;
  "portaloneapp:ConsentRegimes": ConsentRegimes;
  "portaloneapp:ApplicationData": ApplicationData;
  "portaloneapp:DeclarationOfInterest": DeclarationOfInterest;
  "portaloneapp:Declaration": Declaration;
  "_xmlns:portaloneapp": string;
  "_xmlns:xsi": string;
  "_xmlns:bs7666": string;
  "_xmlns:org": string;
  "_xmlns:pdt": string;
  "_xmlns:apd": string;
  "_xmlns:core": string;
  "_xmlns:common": string;
  _Version: string;
}

export interface ApplicationHeader {
  "portaloneapp:ApplicationTo": string;
  "portaloneapp:DateSubmitted": string;
  "portaloneapp:RefNum": string;
  "portaloneapp:FormattedRefNum": string;
  "portaloneapp:ApplicationVersion": number;
  "portaloneapp:AttachmentsChanged": boolean;
  "portaloneapp:Payment": Payment;
}

export interface Payment {
  "common:PaymentMethod": string;
  "common:AmountDue": number;
  "common:AmountPaid": number;
  "common:Currency": string;
}

export interface FileAttachments {
  "common:FileAttachment": FileAttachment[];
}

export interface FileAttachment {
  "common:Identifier"?: string;
  "common:FileName": string;
  "common:Reference": string;
}

export interface ApplicantOrAgent {
  "common:PersonName": PersonName;
  "common:OrgName": string;
  "common:ExternalAddress": ExternalAddress;
  "common:ContactDetails": ContactDetails;
}

export interface PersonName {
  "pdt:PersonNameTitle": string;
  "pdt:PersonGivenName": string;
  "pdt:PersonFamilyName": string;
}

export interface ExternalAddress {
  "common:InternationalAddress": InternationalAddress;
}

export interface InternationalAddress {
  "apd:IntAddressLine": string[];
  "apd:Country"?: string;
  "apd:InternationalPostCode": string;
}

export interface ContactDetails {
  "common:Email": Email;
  "common:Telephone": Telephone;
  _PreferredContactMedium: string;
}

export interface Email {
  "apd:EmailAddress": string;
  _EmailUsage: string;
  _EmailPreferred: string;
}

export interface Telephone {
  "apd:TelNationalNumber": number;
  _TelUse: string;
  _TelPreferred: string;
  _TelMobile: string;
}
export interface SiteLocation {
  "bs7666:BS7666Address": Bs7666Bs7666Address;
  "common:SiteGridRefence": SiteGridRefence;
}

export interface Bs7666Bs7666Address {
  "bs7666:PAON": Bs7666Paon;
  "bs7666:StreetDescription": string;
  "bs7666:Town": string;
  "bs7666:AdministrativeArea"?: string;
  "bs7666:PostTown"?: string;
  "bs7666:PostCode": string;
  "bs7666:UniquePropertyReferenceNumber": string;
}

export interface Bs7666Paon {
  "bs7666:Description": string;
}

export interface SiteGridRefence {
  "bs7666:X": number;
  "bs7666:Y": number;
}

export interface ApplicationScenario {
  "portaloneapp:ScenarioNumber": string;
}

export interface ConsentRegimes {
  "portaloneapp:ConsentRegime": string;
}

export interface ApplicationData {
  "portaloneapp:Advice": Advice;
  "portaloneapp:SiteVisit": SiteVisit;
  "portaloneapp:CertificateLawfulness":
    | ExistingUseApplication
    | ProposedUseApplication;
}

export interface Advice {
  "common:HaveSoughtAdvice": string;
}

export interface SiteVisit {
  "common:SeeSite": string;
  "common:VisitContactDetails": VisitContactDetails;
}

export interface VisitContactDetails {
  "common:ContactAgent": string;
}

export interface ExistingUseApplication {
  "portaloneapp:ExistingUseApplication": {
    "portaloneapp:DescriptionCEU": string;
    "portaloneapp:GroundsCEU": GroundsCEU;
    "portaloneapp:InformationCEU": InformationCEU;
  };
}

export interface GroundsCEU {
  "common:CertificateLawfulnessReason": string;
}

export interface InformationCEU {
  "common:UseBegunDate": string;
}

export interface ProposedUseApplication {
  "portaloneapp:ProposedUseApplication": {
    "portaloneapp:DescriptionCPU": DescriptionCpu;
    "portaloneapp:GroundsCPU": GroundsCpu;
  };
}

export interface DescriptionCpu {
  "common:IsUseChange": string;
  "common:ProposedUseDescription": string;
  "common:ExistingUseDescription": string;
  "common:IsUseStarted": string;
}

export interface GroundsCpu {
  "common:UseLawfulnessReason": string;
  "common:SupportingInformation": SupportingInformation;
  "common:ProposedUseStatus": string;
  "common:LawfulDevCertificateReason": string;
}

export interface SupportingInformation {
  "common:AdditionalInformation": boolean;
  "common:Reference": string;
}

export interface DeclarationOfInterest {
  "common:IsRelated": string;
}

export interface Declaration {
  "common:DeclarationDate": string;
  "common:DeclarationMade": string;
  "common:Signatory": Signatory;
}

export interface Signatory {
  _PersonRole: string;
}
