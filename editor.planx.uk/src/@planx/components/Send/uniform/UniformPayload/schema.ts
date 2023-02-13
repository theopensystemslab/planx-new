import { z } from "zod";

// Models the XML payload required by Uniform to process PlanX applications

export const paymentSchema = z.object({
  "common:PaymentMethod": z.string().default("OnlineViaPortal"),
  "common:AmountDue": z.number().default(0),
  "common:AmountPaid": z.number().default(0),
  "common:Currency": z.string().default("GBP"),
});

export const fileAttachmentSchema = z.object({
  "common:Identifier": z.string().optional(),
  "common:FileName": z.string(),
  "common:Reference": z.string().default("Other"),
});

export const personNameSchema = z.object({
  "pdt:PersonNameTitle": z.string().optional(),
  "pdt:PersonGivenName": z.string(),
  "pdt:PersonFamilyName": z.string(),
});

export const internationalAddressSchema = z.object({
  "apd:IntAddressLine": z.array(z.string()),
  "apd:Country": z.string().optional(),
  "apd:InternationalPostCode": z.string().optional(),
});

export const emailSchema = z.object({
  "apd:EmailAddress": z.string(),
  _EmailUsage: z.string().default("work"),
  _EmailPreferred: z.string().default("yes"),
});

export const telephoneSchema = z.object({
  "apd:TelNationalNumber": z.string(),
  _TelUse: z.string().default("work"),
  _TelPreferred: z.string().default("no"),
  _TelMobile: z.string().default("yes"),
});

export const bs7666PaonSchema = z.object({
  "bs7666:Description": z.string(),
});

export const siteGridRefenceSchema = z.object({
  "bs7666:X": z.number().positive(),
  "bs7666:Y": z.number().positive(),
});

export const applicationScenarioSchema = z.object({
  "portaloneapp:ScenarioNumber": z.union([z.literal("14"), z.literal("15")]),
});

export const consentRegimesSchema = z.object({
  "portaloneapp:ConsentRegime": z.union([
    z.literal("Householder"),
    z.literal("Full"),
    z.literal("Outline"),
    z.literal("Conservation Area"),
    z.literal("Listed Building"),
    z.literal("Advertisement"),
    z.literal("Certificate of Lawfulness"),
    z.literal("Reserved Matters"),
    z.literal("Prior Approval"),
    z.literal("Work to Trees"),
    z.literal("Regulation 3"),
    z.literal("Trees (TPO)"),
    z.literal("Trees (Conservation Area)"),
    z.literal("Hedgerows"),
    z.literal("Non-Material Amendment"),
    z.literal("Trees and Hedgerows"),
    z.literal("Minerals"),
    z.literal("Waste"),
  ]),
});

export const adviceSchema = z.object({
  "common:HaveSoughtAdvice": z.boolean(),
});

export const visitContactDetailsSchema = z.object({
  "common:ContactAgent": z.string(),
});

export const groundsCEUSchema = z.object({
  "common:CertificateLawfulnessReason": z.string(),
});

export const informationCEUSchema = z.object({
  "common:UseBegunDate": z.string().optional(),
});

export const descriptionCpuSchema = z.object({
  "common:IsUseChange": z.boolean().optional(),
  "common:ProposedUseDescription": z.string(),
  "common:ExistingUseDescription": z.string(),
  "common:IsUseStarted": z.boolean().optional(),
});

export const supportingInformationSchema = z.object({
  "common:AdditionalInformation": z.boolean().default(true),
  "common:Reference": z.string(),
});

export const declarationOfInterestSchema = z.object({
  "common:IsRelated": z.boolean(),
});

export const signatorySchema = z.object({
  _PersonRole: z.string(),
});

export const applicationHeaderSchema = z.object({
  "portaloneapp:ApplicationTo": z.string(),
  "portaloneapp:DateSubmitted": z.string(),
  "portaloneapp:RefNum": z.string(),
  "portaloneapp:FormattedRefNum": z.string(),
  "portaloneapp:ApplicationVersion": z.number().default(1),
  "portaloneapp:AttachmentsChanged": z.boolean().default(false),
  "portaloneapp:Payment": paymentSchema,
});

export const fileAttachmentsSchema = z.object({
  "common:FileAttachment": z.array(fileAttachmentSchema),
});

export const externalAddressSchema = z.object({
  "common:InternationalAddress": internationalAddressSchema,
});

export const contactDetailsSchema = z.object({
  "common:Email": emailSchema,
  "common:Telephone": telephoneSchema,
  _PreferredContactMedium: z.string().default("E-Mail"),
});

export const bs7666Bs7666AddressSchema = z.object({
  "bs7666:PAON": bs7666PaonSchema,
  "bs7666:StreetDescription": z.string().optional(),
  "bs7666:Town": z.string().optional(),
  "bs7666:AdministrativeArea": z.string().optional(),
  "bs7666:PostTown": z.string().optional(),
  "bs7666:PostCode": z.string().optional(),
  "bs7666:UniquePropertyReferenceNumber": z.string().optional(),
});

export const siteVisitSchema = z.object({
  "common:SeeSite": z.boolean(),
  "common:VisitContactDetails": visitContactDetailsSchema,
});

export const existingUseApplicationSchema = z.object({
  "portaloneapp:ExistingUseApplication": z.object({
    "portaloneapp:DescriptionCEU": z.string(),
    "portaloneapp:GroundsCEU": groundsCEUSchema,
    "portaloneapp:InformationCEU": informationCEUSchema,
  }),
});

export const groundsCpuSchema = z.object({
  "common:UseLawfulnessReason": z.string(),
  "common:SupportingInformation": supportingInformationSchema,
  "common:ProposedUseStatus": z.string(),
  "common:LawfulDevCertificateReason": z.string(),
});

export const declarationSchema = z.object({
  "common:DeclarationDate": z.string(),
  "common:DeclarationMade": z.string(),
  "common:Signatory": signatorySchema,
});

export const applicantOrAgentSchema = z.object({
  "common:PersonName": personNameSchema,
  "common:OrgName": z.string().optional(),
  "common:ExternalAddress": externalAddressSchema,
  "common:ContactDetails": contactDetailsSchema,
});

export const siteLocationSchema = z.object({
  "bs7666:BS7666Address": bs7666Bs7666AddressSchema,
  "common:SiteGridRefence": siteGridRefenceSchema,
});

export const proposedUseApplicationSchema = z.object({
  "portaloneapp:ProposedUseApplication": z.object({
    "portaloneapp:DescriptionCPU": descriptionCpuSchema,
    "portaloneapp:GroundsCPU": groundsCpuSchema,
  }),
});

export const applicationDataSchema = z.object({
  "portaloneapp:Advice": adviceSchema,
  "portaloneapp:SiteVisit": siteVisitSchema,
  "portaloneapp:CertificateLawfulness": z.union([
    existingUseApplicationSchema,
    proposedUseApplicationSchema,
  ]),
});

export const proposalSchema = z.object({
  "portaloneapp:SchemaVersion": z.number().default(1.3),
  "portaloneapp:ApplicationHeader": applicationHeaderSchema,
  "portaloneapp:FileAttachments": fileAttachmentsSchema,
  "portaloneapp:Applicant": applicantOrAgentSchema,
  "portaloneapp:Agent": applicantOrAgentSchema.or(z.undefined()),
  "portaloneapp:SiteLocation": siteLocationSchema,
  "portaloneapp:ApplicationScenario": applicationScenarioSchema,
  "portaloneapp:ConsentRegimes": consentRegimesSchema,
  "portaloneapp:ApplicationData": applicationDataSchema,
  "portaloneapp:DeclarationOfInterest": declarationOfInterestSchema,
  "portaloneapp:Declaration": declarationSchema,
  "_xmlns:portaloneapp": z
    .string()
    .default("http://www.govtalk.gov.uk/planning/OneAppProposal-2006"),
  "_xmlns:xsi": z.string().default("http://www.w3.org/2001/XMLSchema-instance"),
  "_xmlns:bs7666": z
    .string()
    .default("http://www.govtalk.gov.uk/people/bs7666"),
  "_xmlns:org": z
    .string()
    .default("http://www.govtalk.gov.uk/financial/OrganisationIdentifiers"),
  "_xmlns:pdt": z
    .string()
    .default("http://www.govtalk.gov.uk/people/PersonDescriptives"),
  "_xmlns:apd": z
    .string()
    .default("http://www.govtalk.gov.uk/people/AddressAndPersonalDetails"),
  "_xmlns:core": z.string().default("http://www.govtalk.gov.uk/core"),
  "_xmlns:common": z
    .string()
    .default("http://www.govtalk.gov.uk/planning/OneAppCommon-2006"),
  _Version: z.string().default("1.3"),
});

export const xmlDeclarationSchema = z.object({
  _version: z.string().default("1.0"),
  _encoding: z.string().default("UTF-8"),
  _standalone: z.string().default("yes"),
});

export const iUniformPayloadSchema = z.object({
  "portaloneapp:Proposal": proposalSchema,
  "?xml": xmlDeclarationSchema,
});
