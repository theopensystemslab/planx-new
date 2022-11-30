import { Address } from "@planx/components/AddressInput/model";
import { SiteAddress } from "@planx/components/FindProperty/model";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import { get } from "lodash";

import { Store } from "../../../../../pages/FlowEditor/lib/store/index";
import { UniformPayload } from "./model";

const parser = new XMLParser();

describe("UniformPayload", () => {
  const sessionId = "123";
  const files: string[] = [];
  const hasBoundary = false;

  it("safely escapes special XML characters", () => {
    const passport: Store.passport = {
      data: { "proposal.description": `< > & " '` },
    };
    const xmlString = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    const isValid = XMLValidator.validate(xmlString);
    expect(isValid).toBe(true);
  });
});

describe("correctly sets planx sessionId as the Uniform reference number", () => {
  const sessionId = "1234-abcdef-567-ghijklm";
  const files: string[] = [];
  const hasBoundary = false;
  const passport: Store.passport = { data: {} };

  it("sets sessionId", () => {
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    const expectedRefNum: String = "1234-abcdef-567-ghijklm";

    let result = parser.parse(xml);
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

describe("correctly sets proposal completion date", () => {
  const sessionId = "123";
  const files: string[] = [];
  const hasBoundary = false;
  const formattedNow = new Date(Date.now()).toISOString().split("T")[0];

  it("reads from `proposal.completion.date` passport variable if it exists", () => {
    const passport: Store.passport = {
      data: { "proposal.completion.date": "2022-01-01" },
    };
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    const expectedCompletionDate: String = "2022-01-01";

    let result = parser.parse(xml);
    const resultCompletionDate =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:DateSubmitted"
      ];

    expect(resultCompletionDate).toEqual(expectedCompletionDate);
  });

  it("defaults to now if `proposal.completion.date` passport variable is missing", () => {
    const passport: Store.passport = {
      data: { "proposal.description": "test" },
    };
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    const expectedCompletionDate: String = formattedNow;

    let result = parser.parse(xml);
    const resultCompletionDate =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:DateSubmitted"
      ];

    expect(resultCompletionDate).toEqual(expectedCompletionDate);
  });
});

describe("correctly sets payment details", () => {
  const sessionId = "123";
  const files: string[] = [];
  const hasBoundary = false;

  it("reads from Pay passport variables if they exist", () => {
    const passport: Store.passport = {
      data: {
        "application.fee.payable": 103,
        "application.fee.reference.govPay": {
          amount: 103,
        },
      },
    };
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    const expectedPayment = {
      "common:PaymentMethod": "OnlineViaPortal",
      "common:AmountDue": 103,
      "common:AmountPaid": 103,
      "common:Currency": "GBP",
    };

    let result = parser.parse(xml);
    const resultPayment =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:Payment"
      ];

    expect(resultPayment).toMatchObject(expectedPayment);
  });

  it("defaults to 0 if resubmission or if Pay passport variables are missing", () => {
    const passport: Store.passport = {
      data: { "proposal.description": "test" },
    };
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    const expectedPayment = {
      "common:PaymentMethod": "OnlineViaPortal",
      "common:AmountDue": 0,
      "common:AmountPaid": 0,
      "common:Currency": "GBP",
    };

    let result = parser.parse(xml);
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
  const parser = new XMLParser({ ignoreAttributes: false });
  const sessionId = "123";
  const files: string[] = [];
  const hasBoundary = false;

  it("maps the 'applicationTo' value", () => {
    const passport: Store.passport = {
      data: { "uniform.applicationTo": ["TEST123"] },
    };

    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();

    const result = parser.parse(xml);
    const applicationTo =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationHeader"][
        "portaloneapp:ApplicationTo"
      ];
    expect(applicationTo).toBe("TEST123");
  });

  it("maps the 'applicationScenario' value for an Existing LDC", () => {
    const passport: Store.passport = {
      data: {
        "uniform.scenarioNumber": ["14"],
        "uniform.consentRegime": ["Certificate of Lawfulness"],
        "application.type": "ldc.existing",
      },
    };

    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();

    const result = parser.parse(xml);
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
        "uniform.scenarioNumber": ["15"],
        "uniform.consentRegime": ["Certificate of Lawfulness"],
        "application.type": "ldc.proposed",
      },
    };

    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();

    const result = parser.parse(xml);
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
      data: { "uniform.siteVisit": ["true"] },
    };

    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();

    const result = parser.parse(xml);
    const siteVisit =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationData"][
        "portaloneapp:SiteVisit"
      ]["common:SeeSite"];
    expect(siteVisit).toBe(true);
  });

  it("maps the 'isRelated' value with a connection", () => {
    const passport: Store.passport = {
      data: { "uniform.isRelated": ["true"] },
    };

    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();

    const result = parser.parse(xml);
    const isRelated =
      result["portaloneapp:Proposal"]["portaloneapp:DeclarationOfInterest"][
        "common:IsRelated"
      ];
    expect(isRelated).toBe(true);
  });

  it("maps the 'isRelated' value without a connection", () => {
    const passport: Store.passport = {
      data: { "uniform.isRelated": ["false"] },
    };

    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();

    const result = parser.parse(xml);
    const isRelated =
      result["portaloneapp:Proposal"]["portaloneapp:DeclarationOfInterest"][
        "common:IsRelated"
      ];
    expect(isRelated).toBe(false);
  });

  it("maps the 'personRole' value for an Agent", () => {
    const passport: Store.passport = {
      data: { "uniform.personRole": ["Agent"] },
    };

    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();

    const result = parser.parse(xml);
    const personRole =
      result["portaloneapp:Proposal"]["portaloneapp:Declaration"][
        "common:Signatory"
      ]["@_PersonRole"];
    expect(personRole).toBe("Agent");
  });

  it("maps the 'personRole' value for an Applicant", () => {
    const passport: Store.passport = {
      data: { "uniform.personRole": ["Applicant"] },
    };

    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();

    const result = parser.parse(xml);
    const personRole =
      result["portaloneapp:Proposal"]["portaloneapp:Declaration"][
        "common:Signatory"
      ]["@_PersonRole"];
    expect(personRole).toBe("Applicant");
  });

  it("maps the 'isUseChange' value", () => {
    const passport: Store.passport = {
      data: {
        "uniform.isUseChange": ["true"],
        "application.type": ["ldc.proposed"],
      },
    };
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    const result = parser.parse(xml);
    const isUseChange =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationData"][
        "portaloneapp:CertificateLawfulness"
      ]["portaloneapp:ProposedUseApplication"]["portaloneapp:DescriptionCPU"][
        "common:IsUseChange"
      ];
    expect(isUseChange).toBe(true);
  });
});

describe("Applicant address", () => {
  const harryPotterAddress: Partial<SiteAddress> = {
    title: "4, Privet Drive, Little Whinging, Surrey",
    postcode: "GU22 7QQ",
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
  const hasBoundary = false;
  const applicantAddressKey =
    "portaloneapp:Proposal.portaloneapp:Applicant.common:ExternalAddress";

  it("should populate the address for a 'resident' application", () => {
    const passport: Store.passport = {
      data: {
        "applicant.resident": ["true"],
        _address: harryPotterAddress,
      },
    };
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    let result = parser.parse(xml);
    const expectedAddress = {
      "common:InternationalAddress": {
        "apd:IntAddressLine": [4, "Privet Drive", "Little Whinging", "Surrey"],
        "apd:InternationalPostCode": "GU22 7QQ",
      },
    };
    const resultAddress = get(result, applicantAddressKey);
    expect(resultAddress).toMatchObject(expectedAddress);
  });

  it("should populate the address for a 'non-resident' application", () => {
    const passport: Store.passport = {
      data: {
        "applicant.resident": ["false"],
        _address: harryPotterAddress,
        "applicant.address": sherlockHolmesAddress,
      },
    };
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    let result = parser.parse(xml);
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
    const resultAddress = get(result, applicantAddressKey);
    expect(resultAddress).toMatchObject(expectedAddress);
  });
});

describe("Applicant contact details", () => {
  const sessionId = "123";
  const files: string[] = [];

  const applicantKey: string = "portaloneapp:Proposal.portaloneapp:Applicant";
  const expectedApplicant = {
    "common:PersonName": {
      "pdt:PersonNameTitle": "Mme",
      "pdt:PersonGivenName": "Jane",
      "pdt:PersonFamilyName": "Doe",
    },
    "common:OrgName": "DLUHC",
    "common:ContactDetails": {
      "common:Email": {
        "apd:EmailAddress": "jane@gov.uk",
      },
      "common:Telephone": {
        "apd:TelNationalNumber": 123456789,
      },
    },
  };

  it("should populate the Applicant when TextInput components are used", () => {
    const passport: Store.passport = {
      data: {
        "applicant.title": "Mme",
        "applicant.name.first": "Jane",
        "applicant.name.last": "Doe",
        "applicant.company.name": "DLUHC",
        "applicant.phone.primary": "0123456789",
        "applicant.email": "jane@gov.uk",
      },
    };

    const xml = makeXmlString({
      passport,
      sessionId,
      files,
      hasBoundary: false,
    });
    let result = parser.parse(xml);
    const resultApplicant = get(result, applicantKey);
    expect(resultApplicant).toMatchObject(expectedApplicant);
  });

  it("should populate the Applicant when a ContactInput component is used", () => {
    const passport: Store.passport = {
      data: {
        "_contact.applicant": {
          applicant: {
            title: "Mme",
            firstName: "Jane",
            lastName: "Doe",
            organisation: "Local planning authority",
            phone: "0123456789",
            email: "jane@gov.uk",
          },
        },
        "applicant.title": "Mme",
        "applicant.name.first": "Jane",
        "applicant.name.last": "Doe",
        "applicant.company.name": "DLUHC",
        "applicant.phone.primary": "0123456789",
        "applicant.email": "jane@gov.uk",
      },
    };

    const xml = makeXmlString({
      passport,
      sessionId,
      files,
      hasBoundary: false,
    });
    let result = parser.parse(xml);
    const resultApplicant = get(result, applicantKey);
    expect(resultApplicant).toMatchObject(expectedApplicant);
  });
});

describe("file handling", () => {
  const sessionId = "123";
  const files: string[] = [];
  const passport: Store.passport = { data: {} };
  const hasBoundary = false;
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
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    const isValid = XMLValidator.validate(xml);
    expect(isValid).toBe(true);
    let result = parser.parse(xml);
    const fileAttachments = get(result, fileAttachmentsKey);
    expect(fileAttachments).toEqual(
      expect.arrayContaining(expectedFileDeclarations)
    );
  });

  it("includes a generated review file", () => {
    const expectedReviewFileDeclaration = {
      "common:FileName": "review.html",
      "common:Reference": "Other",
    };
    const xmlString = makeXmlString({
      passport,
      sessionId,
      files,
      hasBoundary: false,
    });
    const isValid = XMLValidator.validate(xmlString);
    expect(isValid).toBe(true);
    let result = parser.parse(xmlString);
    const fileAttachments = get(result, fileAttachmentsKey);
    expect(fileAttachments).toEqual(
      expect.arrayContaining([expectedReviewFileDeclaration])
    );
  });

  it("includes a generated boundary geojson file when possible", () => {
    const hasBoundary = true;
    const expectedBoundaryFileDeclaration = {
      "common:FileName": "boundary.geojson",
      "common:Reference": "Other",
    };
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    const isValid = XMLValidator.validate(xml);
    expect(isValid).toBe(true);
    let result = parser.parse(xml);
    const fileAttachments = get(result, fileAttachmentsKey);
    expect(fileAttachments).toEqual(
      expect.arrayContaining([expectedBoundaryFileDeclaration])
    );
  });

  it("does not include a boundary geojson file when not possible", () => {
    const expectedBoundaryFileDeclaration = {
      "common:FileName": "boundary.geojson",
      "common:Reference": "Other",
    };
    const xml = new UniformPayload(
      sessionId,
      passport,
      files,
      hasBoundary
    ).buildXML();
    const isValid = XMLValidator.validate(xml);
    expect(isValid).toBe(true);
    let result = parser.parse(xml);
    const fileAttachments = get(result, fileAttachmentsKey);
    expect(fileAttachments).not.toEqual(
      expect.arrayContaining([expectedBoundaryFileDeclaration])
    );
  });
});
