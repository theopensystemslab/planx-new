import { Address } from "@planx/components/AddressInput/model";
import { SiteAddress } from "@planx/components/FindProperty/model";
import { X2jOptionsOptional, XMLParser, XMLValidator } from "fast-xml-parser";
import { get } from "lodash";

import { Store } from "../../../../../pages/FlowEditor/lib/store/index";
import { mockProposedLDCPassportData } from "./mocks/passport";
import { UniformPayload } from "./model";
import {
  ApplicantOrAgent,
  FileAttachment,
  IUniformPayload,
  ProposedUseApplication,
} from "./types";

// Match build options in UniformPayload.buildXML()
const parseOptions: X2jOptionsOptional = {
  ignoreAttributes: false,
  attributeNamePrefix: "_",
};

const parser = new XMLParser(parseOptions);

describe("UniformPayload", () => {
  const sessionId = "123";
  const files: string[] = [];

  it("generates an xml declaration at the top of the document", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
      },
    };
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const isValid = XMLValidator.validate(xml!);
    expect(isValid).toBe(true);
    const declaration = xml!.slice(0, 56);
    const expectedDeclaration = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;
    expect(declaration).toEqual(expectedDeclaration);
  });

  it("safely escapes special XML characters", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "proposal.description": `< > & " '`,
      },
    };
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const isValid = XMLValidator.validate(xml!);
    expect(isValid).toBe(true);
  });
});

describe("Reference number", () => {
  const sessionId = "1234-abcdef-567-ghijklm";
  const files: string[] = [];
  const passport: Store.passport = { data: mockProposedLDCPassportData };

  it("sets sessionId as a reference number", () => {
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const expectedRefNum: String = "1234-abcdef-567-ghijklm";

    const result: IUniformPayload = parser.parse(xml!);
    const resultRefNum =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:RefNum"
      ];
    const resultFormattedRefNum =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:FormattedRefNum"
      ];

    expect(resultRefNum).toEqual(expectedRefNum);
    expect(resultFormattedRefNum).toEqual(expectedRefNum);
  });
});

describe("Proposal completion date", () => {
  const sessionId = "123";
  const files: string[] = [];
  const formattedNow = new Date(Date.now()).toISOString().split("T")[0];

  it("reads from `proposal.completion.date` passport variable if it exists", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "proposal.completion.date": "2022-01-01",
      },
    };
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const expectedCompletionDate: String = "2022-01-01";

    const result: IUniformPayload = parser.parse(xml!);
    const resultCompletionDate =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:DateSubmitted"
      ];

    expect(resultCompletionDate).toEqual(expectedCompletionDate);
  });

  it("defaults to now if `proposal.completion.date` passport variable is missing", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "proposal.description": "test",
      },
    };
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const expectedCompletionDate: String = formattedNow;

    const result: IUniformPayload = parser.parse(xml!);
    const resultCompletionDate =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:DateSubmitted"
      ];

    expect(resultCompletionDate).toEqual(expectedCompletionDate);
  });
});

describe("Payment details", () => {
  const sessionId = "123";
  const files: string[] = [];

  it("reads from Pay passport variables if they exist", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "application.fee.payable": 103,
        "application.fee.reference.govPay": {
          amount: 103,
        },
      },
    };
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const expectedPayment = {
      "common:PaymentMethod": "OnlineViaPortal",
      "common:AmountDue": 103,
      "common:AmountPaid": 103,
      "common:Currency": "GBP",
    };

    const result: IUniformPayload = parser.parse(xml!);
    const resultPayment =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:Payment"
      ];

    expect(resultPayment).toMatchObject(expectedPayment);
  });

  it("defaults to 0 if resubmission or if Pay passport variables are missing", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "proposal.description": "test",
      },
    };
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const expectedPayment = {
      "common:PaymentMethod": "OnlineViaPortal",
      "common:AmountDue": 0,
      "common:AmountPaid": 0,
      "common:Currency": "GBP",
    };

    const result: IUniformPayload = parser.parse(xml!);
    const resultPayment =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:Payment"
      ];

    expect(resultPayment).toMatchObject(expectedPayment);
  });
});

// This tests that the passport values added in the "Open System Lab/Uniform Translator" flow
// are mapped as expected into the XML for Uniform submission
// https://editor.planx.uk/opensystemslab/uniform-translator
describe("Uniform Translator", () => {
  const sessionId = "123";
  const files: string[] = [];

  it("maps the 'applicationTo' value", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "uniform.applicationTo": ["TEST123"],
      },
    };

    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const applicationTo =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:ApplicationTo"
      ];
    expect(applicationTo).toBe("TEST123");
  });

  it("maps the 'applicationScenario' value for an Existing LDC", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "uniform.scenarioNumber": ["14"],
        "uniform.consentRegime": ["Certificate of Lawfulness"],
        "application.type": "ldc.existing",
      },
    };

    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const scenarioNumber =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationScenario"][
        "portaloneapp:ScenarioNumber"
      ];
    const consentRegime =
      result["portaloneapp:Proposal"]["portaloneapp:ConsentRegimes"][
        "portaloneapp:ConsentRegime"
      ];
    expect(scenarioNumber).toBe(14);
    expect(consentRegime).toBe("Certificate of Lawfulness");
  });

  it("maps the 'applicationScenario' value for a Proposed LDC", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "uniform.scenarioNumber": ["15"],
        "uniform.consentRegime": ["Certificate of Lawfulness"],
        "application.type": "ldc.proposed",
      },
    };

    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const scenarioNumber =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationScenario"][
        "portaloneapp:ScenarioNumber"
      ];
    const consentRegime =
      result["portaloneapp:Proposal"]["portaloneapp:ConsentRegimes"][
        "portaloneapp:ConsentRegime"
      ];
    expect(scenarioNumber).toBe(15);
    expect(consentRegime).toBe("Certificate of Lawfulness");
  });

  it("maps the 'siteVisit' value", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "uniform.siteVisit": ["true"],
      },
    };

    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const siteVisit =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationData"][
        "portaloneapp:SiteVisit"
      ]["common:SeeSite"];
    expect(siteVisit).toBe(true);
  });

  it("maps the 'isRelated' value with a connection", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "uniform.isRelated": ["true"],
      },
    };

    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const isRelated =
      result["portaloneapp:Proposal"]["portaloneapp:DeclarationOfInterest"][
        "common:IsRelated"
      ];
    expect(isRelated).toBe(true);
  });

  it("maps the 'isRelated' value without a connection", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "uniform.isRelated": ["false"],
      },
    };

    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const isRelated =
      result["portaloneapp:Proposal"]["portaloneapp:DeclarationOfInterest"][
        "common:IsRelated"
      ];
    expect(isRelated).toBe(false);
  });

  it("maps the 'personRole' value for an Agent", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "uniform.personRole": ["Agent"],
      },
    };

    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const personRole =
      result["portaloneapp:Proposal"]["portaloneapp:Declaration"][
        "common:Signatory"
      ]["_PersonRole"];
    expect(personRole).toBe("Agent");
  });

  it("maps the 'personRole' value for an Applicant", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "uniform.personRole": ["Applicant"],
      },
    };

    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const personRole =
      result["portaloneapp:Proposal"]["portaloneapp:Declaration"][
        "common:Signatory"
      ]["_PersonRole"];
    expect(personRole).toBe("Applicant");
  });

  it("maps the 'isUseChange' value", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "uniform.isUseChange": ["true"],
        "application.type": ["ldc.proposed"],
      },
    };
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const certificateOfLawfulness = result["portaloneapp:Proposal"][
      "portaloneapp:ApplicationData"
    ]["portaloneapp:CertificateLawfulness"] as ProposedUseApplication;
    const isUseChange =
      certificateOfLawfulness["portaloneapp:ProposedUseApplication"][
        "portaloneapp:DescriptionCPU"
      ]["common:IsUseChange"];
    expect(isUseChange).toBe(true);
  });
});

describe("Applicant address", () => {
  const harryPotterAddress: Partial<SiteAddress> = {
    title: "4, Privet Drive, Little Whinging, Surrey",
    postcode: "GU22 7QQ",
    x: 123,
    y: 456,
  };
  const sherlockHolmesAddress: Address = {
    country: "UK",
    county: "Greater London",
    line1: "221b Baker Street",
    line2: "",
    postcode: "NW1 6XE",
    town: "Marylebone",
  };
  const sessionId = "123";
  const files: string[] = [];
  const applicantAddressKey =
    "portaloneapp:Proposal.portaloneapp:Applicant.common:ExternalAddress";

  it("should populate the address for a 'resident' application", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "applicant.resident": ["true"],
        _address: harryPotterAddress,
      },
    };
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const expectedAddress = {
      "common:InternationalAddress": {
        "apd:IntAddressLine": [4, "Privet Drive", "Little Whinging", "Surrey"],
        "apd:InternationalPostCode": "GU22 7QQ",
      },
    };
    const resultAddress: Address = get(result, applicantAddressKey);
    expect(resultAddress).toMatchObject(expectedAddress);
  });

  it("should populate the address for a 'non-resident' application", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "applicant.resident": ["false"],
        _address: harryPotterAddress,
        "applicant.address": sherlockHolmesAddress,
      },
    };
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();

    const result: IUniformPayload = parser.parse(xml!);
    const expectedAddress = {
      "common:InternationalAddress": {
        "apd:IntAddressLine": [
          "221b Baker Street",
          "Marylebone",
          "Greater London",
        ],
        "apd:Country": "UK",
        "apd:InternationalPostCode": "NW1 6XE",
      },
    };
    const resultAddress: Address = get(result, applicantAddressKey);
    expect(resultAddress).toMatchObject(expectedAddress);
  });
});

describe("Applicant contact details", () => {
  const sessionId = "123";
  const files: string[] = [];

  const applicantKey: string = "portaloneapp:Proposal.portaloneapp:Applicant";
  const expectedApplicant: ApplicantOrAgent = {
    "common:PersonName": {
      "pdt:PersonNameTitle": "Mme",
      "pdt:PersonGivenName": "Jane",
      "pdt:PersonFamilyName": "Doe",
    },
    "common:OrgName": "DLUHC",
    "common:ContactDetails": {
      "common:Email": {
        "apd:EmailAddress": "jane@gov.uk",
        _EmailUsage: "work",
        _EmailPreferred: "yes",
      },
      "common:Telephone": {
        "apd:TelNationalNumber": "(01234) 567890",
        _TelUse: "work",
        _TelPreferred: "no",
        _TelMobile: "yes",
      },
      _PreferredContactMedium: "E-Mail",
    },
    "common:ExternalAddress": {
      "common:InternationalAddress": {
        "apd:IntAddressLine": ["1a", "AMERSHAM ROAD", "BEACONSFIELD"],
        "apd:InternationalPostCode": "HP9 2HA",
      },
    },
  };

  it("should populate the Applicant when TextInput components are used", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "applicant.title": "Mme",
        "applicant.name.first": "Jane",
        "applicant.name.last": "Doe",
        "applicant.company.name": "DLUHC",
        "applicant.phone.primary": "(01234) 567890",
        "applicant.email": "jane@gov.uk",
      },
    };

    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const result: IUniformPayload = parser.parse(xml!);
    const resultApplicant: ApplicantOrAgent = get(result, applicantKey);
    expect(resultApplicant).toMatchObject(expectedApplicant);
  });

  it("should populate the Applicant when a ContactInput component is used", () => {
    const passport: Store.passport = {
      data: {
        ...mockProposedLDCPassportData,
        "_contact.applicant": {
          applicant: {
            title: "Mme",
            firstName: "Jane",
            lastName: "Doe",
            organisation: "Local planning authority",
            phone: "(01234) 567890",
            email: "jane@gov.uk",
          },
        },
        "applicant.title": "Mme",
        "applicant.name.first": "Jane",
        "applicant.name.last": "Doe",
        "applicant.company.name": "DLUHC",
        "applicant.phone.primary": "(01234) 567890",
        "applicant.email": "jane@gov.uk",
      },
    };

    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const result: IUniformPayload = parser.parse(xml!);
    const resultApplicant: ApplicantOrAgent = get(result, applicantKey);
    expect(resultApplicant).toMatchObject(expectedApplicant);
  });
});

describe("File handling", () => {
  const sessionId = "123";
  const files: string[] = [];
  const passport: Store.passport = { data: mockProposedLDCPassportData };
  const fileAttachmentsKey =
    "portaloneapp:Proposal.portaloneapp:FileAttachments.common:FileAttachment";

  it("includes required files", () => {
    const expectedFileDeclarations = [
      {
        "common:FileName": "application.csv",
        "common:Reference": "Other",
      },
      {
        "common:Identifier": "N10049",
        "common:FileName": "proposal.xml",
        "common:Reference": "Schema XML File",
      },
    ];
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const isValid = XMLValidator.validate(xml!);
    expect(isValid).toBe(true);
    const result: IUniformPayload = parser.parse(xml!);
    const fileAttachments: FileAttachment[] = get(result, fileAttachmentsKey);
    expect(fileAttachments).toEqual(
      expect.arrayContaining(expectedFileDeclarations)
    );
  });

  it("includes auto generated files", () => {
    const expectedReviewFileDeclarations = [
      {
        "common:FileName": "Overview.htm",
        "common:Reference": "Other",
      },
    ];
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const isValid = XMLValidator.validate(xml!);
    expect(isValid).toBe(true);
    const result: IUniformPayload = parser.parse(xml!);
    const fileAttachments: FileAttachment[] = get(result, fileAttachmentsKey);
    expect(fileAttachments).toEqual(
      expect.arrayContaining(expectedReviewFileDeclarations)
    );
  });

  it("includes generated boundary GeoJSON and HTML files when 'property.boundary.site' is present in the passport", () => {
    const expectedBoundaryFileDeclarations = [
      {
        "common:FileName": "LocationPlanGeoJSON.geojson",
        "common:Reference": "Other",
      },
      {
        "common:FileName": "LocationPlan.htm",
        "common:Reference": "Other",
      },
    ];
    const xml = new UniformPayload({
      sessionId,
      passport: {
        data: {
          ...passport.data,
          "property.boundary.site": {},
        },
      },
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const isValid = XMLValidator.validate(xml!);
    expect(isValid).toBe(true);
    const result: IUniformPayload = parser.parse(xml!);
    const fileAttachments: FileAttachment[] = get(result, fileAttachmentsKey);
    expect(fileAttachments).toEqual(
      expect.arrayContaining(expectedBoundaryFileDeclarations)
    );
  });

  it("does not include a boundary geojson file when 'property.boundary.site' is not present in the passport", () => {
    const xml = new UniformPayload({
      sessionId,
      passport,
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const isValid = XMLValidator.validate(xml!);
    expect(isValid).toBe(true);
    const result: IUniformPayload = parser.parse(xml!);
    const fileAttachments: FileAttachment[] = get(result, fileAttachmentsKey);
    expect(fileAttachments).not.toEqual(
      expect.arrayContaining([
        {
          "common:FileName": "LocationPlanGeoJSON.geojson",
          "common:Reference": "Other",
        },
      ])
    );
  });

  it("includes template doc files when the flow has document templates", () => {
    const expectedBoundaryFileDeclarations = [
      {
        "common:FileName": "LDCE.doc",
        "common:Reference": "Other",
      },
      {
        "common:FileName": "LDCE_redacted.doc",
        "common:Reference": "Other",
      },
    ];
    const xml = new UniformPayload({
      sessionId,
      passport,
      templateNames: ["LDCE", "LDCE_redacted"],
      files,
    }).buildXML();
    expect(xml).not.toBeUndefined();
    const isValid = XMLValidator.validate(xml!);
    expect(isValid).toBe(true);
    const result: UniformPayload = parser.parse(xml!);
    const fileAttachments: FileAttachment[] = get(result, fileAttachmentsKey);
    expect(fileAttachments).toEqual(
      expect.arrayContaining(expectedBoundaryFileDeclarations)
    );
  });
});
