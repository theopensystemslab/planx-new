import { z } from "zod";

import * as schema from "./schema";

export type Payment = z.infer<typeof schema.paymentSchema>;

export type FileAttachment = z.infer<typeof schema.fileAttachmentSchema>;

export type PersonName = z.infer<typeof schema.personNameSchema>;

export type InternationalAddress = z.infer<
  typeof schema.internationalAddressSchema
>;

export type Email = z.infer<typeof schema.emailSchema>;

export type Telephone = z.infer<typeof schema.telephoneSchema>;

export type Bs7666Paon = z.infer<typeof schema.bs7666PaonSchema>;

export type SiteGridRefence = z.infer<typeof schema.siteGridRefenceSchema>;

export type ApplicationScenario = z.infer<
  typeof schema.applicationScenarioSchema
>;

export type ConsentRegimes = z.infer<typeof schema.consentRegimesSchema>;

export type Advice = z.infer<typeof schema.adviceSchema>;

export type VisitContactDetails = z.infer<
  typeof schema.visitContactDetailsSchema
>;

export type GroundsCEU = z.infer<typeof schema.groundsCEUSchema>;

export type InformationCEU = z.infer<typeof schema.informationCEUSchema>;

export type DescriptionCpu = z.infer<typeof schema.descriptionCpuSchema>;

export type SupportingInformation = z.infer<
  typeof schema.supportingInformationSchema
>;

export type DeclarationOfInterest = z.infer<
  typeof schema.declarationOfInterestSchema
>;

export type Signatory = z.infer<typeof schema.signatorySchema>;

export type ApplicationHeader = z.infer<typeof schema.applicationHeaderSchema>;

export type FileAttachments = z.infer<typeof schema.fileAttachmentsSchema>;

export type ExternalAddress = z.infer<typeof schema.externalAddressSchema>;

export type ContactDetails = z.infer<typeof schema.contactDetailsSchema>;

export type Bs7666Bs7666Address = z.infer<
  typeof schema.bs7666Bs7666AddressSchema
>;

export type SiteVisit = z.infer<typeof schema.siteVisitSchema>;

export type ExistingUseApplication = z.infer<
  typeof schema.existingUseApplicationSchema
>;

export type GroundsCpu = z.infer<typeof schema.groundsCpuSchema>;

export type Declaration = z.infer<typeof schema.declarationSchema>;

export type ApplicantOrAgent = z.infer<typeof schema.applicantOrAgentSchema>;

export type SiteLocation = z.infer<typeof schema.siteLocationSchema>;

export type ProposedUseApplication = z.infer<
  typeof schema.proposedUseApplicationSchema
>;

export type ApplicationData = z.infer<typeof schema.applicationDataSchema>;

export type Proposal = z.infer<typeof schema.proposalSchema>;

export type XmlDeclaration = z.infer<typeof schema.xmlDeclarationSchema>;

export type IUniformPayload = z.infer<typeof schema.iUniformPayloadSchema>;
