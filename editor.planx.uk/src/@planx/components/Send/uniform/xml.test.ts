import { XMLParser, XMLValidator } from "fast-xml-parser";

import { Store } from "./../../../../pages/FlowEditor/lib/store/index";
import { UniformInstance } from "./applicationType";
import { makeXmlString } from "./xml";

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
  })
});

describe("Passport to Uniform XML conversion", () => {
  const harryPotterAddress = {
    country: "UK",
    county: "Surrey",
    line1: "4 Privet Drive",
    line2: "",
    postcode: "GU22 7QQ",
    town: "Little Whinging",
  };
  const sherlockHolmesAddress = {
    country: "UK",
    county: "Greater London",
    line1: "221b Baker Street",
    line2: "",
    postcode: "NW1 6XE",
    town: "Marylebone",
  };
  const sessionId = "123";
  const files: string[] = [];

  it("should populate the address for a 'resident' application", () => {
    const passport: Store.passport = {
      data: {
        resident: [true],
        _address: harryPotterAddress,
      },
    };
    const xml = makeXmlString(
      passport,
      sessionId,
      files,
      UniformInstance.Lambeth
    );
    let result = parser.parse(xml);
    const expectedAddress = {
      "apd:Country": "UK",
      "apd:IntAddressLine": ["4 Privet Drive", "", "Little Whinging", "Surrey"],
      "apd:InternationalPostCode": "GU22 7QQ",
    };
    const resultAddress =
      result["portaloneapp:Proposal"]["portaloneapp:Applicant"][
        "common:ExternalAddress"
      ]["common:InternationalAddress"];
    expect(resultAddress).toMatchObject(expectedAddress);
  });

  it("should populate the address for a 'non-resident' application", () => {
    const passport: Store.passport = {
      data: {
        _address: harryPotterAddress,
        "applicant.address": sherlockHolmesAddress,
      },
    };
    const xml = makeXmlString(
      passport,
      sessionId,
      files,
      UniformInstance.Lambeth
    );
    let result = parser.parse(xml);
    const expectedAddress = {
      "apd:IntAddressLine": [
        "221b Baker Street",
        "",
        "Marylebone",
        "Greater London",
      ],
      "apd:Country": "UK",
      "apd:InternationalPostCode": "NW1 6XE",
    };
    const resultAddress =
      result["portaloneapp:Proposal"]["portaloneapp:Applicant"][
        "common:ExternalAddress"
      ]["common:InternationalAddress"];
    expect(resultAddress).toMatchObject(expectedAddress);
  });
});