import { XMLParser, XMLValidator } from "fast-xml-parser";

import { Store } from "./../../../../../pages/FlowEditor/lib/store/index";
import { UniformInstance } from "./../applicationType";
import { makeXmlString } from "./../xml";

const parser = new XMLParser();

describe("makeXmlString constructor", () => {
  const sessionId = "123";
  const files: string[] = [];

  it("safely escapes special XML characters", () => {
    const passport: Store.passport = {
      data: { "proposal.description": `< > & " '` },
    };
    const xmlString = makeXmlString(
      passport,
      sessionId,
      files,
      UniformInstance.Aylesbury
    );
    const isValid = XMLValidator.validate(xmlString);
    expect(isValid).toBe(true);
  });
});

describe("correctly sets planx sessionId as the Uniform reference number", () => {
  const sessionId = "1234-abcdef-567-ghijklm";
  const files: string[] = [];
  const passport: Store.passport = { data: {} };

  it("sets sessionId", () => {
    const xml = makeXmlString(
      passport,
      sessionId,
      files,
      UniformInstance.Lambeth
    );
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
  const formattedNow = new Date(Date.now()).toISOString().split("T")[0];

  it("reads from `proposal.completion.date` passport variable if it exists", () => {
    const passport: Store.passport = {
      data: { "proposal.completion.date": "2022-01-01" },
    };
    const xml = makeXmlString(
      passport,
      sessionId,
      files,
      UniformInstance.Lambeth
    );
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
    const xml = makeXmlString(
      passport,
      sessionId,
      files,
      UniformInstance.Lambeth
    );
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

  it("reads from Pay passport variables if they exist", () => {
    const passport: Store.passport = {
      data: {
        "application.fee.payable": 103,
        "application.fee.reference.govPay": {
          amount: 103,
        },
      },
    };
    const xml = makeXmlString(
      passport,
      sessionId,
      files,
      UniformInstance.Lambeth
    );
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
    const xml = makeXmlString(
      passport,
      sessionId,
      files,
      UniformInstance.Lambeth
    );
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
