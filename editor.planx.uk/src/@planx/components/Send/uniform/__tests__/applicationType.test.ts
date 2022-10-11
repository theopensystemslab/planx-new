import { XMLParser } from "fast-xml-parser";

import { Store } from "./../../../../../pages/FlowEditor/lib/store/index";
import { UniformInstance } from "./../applicationType";
import { makeXmlString } from "./../xml";

const parser = new XMLParser();

describe("correctly sets application type", () => {
  const sessionId = "123";
  const files: string[] = [];

  it("reads from `application.type` passport variable if it exists", () => {
    const passport: Store.passport = {
      data: { "application.type": ["ldc.proposed"] },
    };
    const xml = makeXmlString(
      passport,
      sessionId,
      files,
      UniformInstance.Lambeth
    );
    const expectedScenarioNumber: Number = 15;
    const expectedConsentRegime: String = "Certificate of Lawfulness";

    let result = parser.parse(xml);
    const resultScenarioNumber =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationScenario"][
        "portaloneapp:ScenarioNumber"
      ];
    const resultConsentRegime =
      result["portaloneapp:Proposal"]["portaloneapp:ConsentRegimes"][
        "portaloneapp:ConsentRegime"
      ];

    expect(resultScenarioNumber).toEqual(expectedScenarioNumber);
    expect(resultConsentRegime).toEqual(expectedConsentRegime);
  });

  it("defaults to ldc.existing if `application.type` passport variable is missing", () => {
    const passport: Store.passport = {
      data: { "application.description": "test" },
    };

    const xml = makeXmlString(
      passport,
      sessionId,
      files,
      UniformInstance.Lambeth
    );
    const expectedScenarioNumber: Number = 14;
    const expectedConsentRegime: String = "Certificate of Lawfulness";

    let result = parser.parse(xml);
    const resultScenarioNumber =
      result["portaloneapp:Proposal"]["portaloneapp:ApplicationScenario"][
        "portaloneapp:ScenarioNumber"
      ];
    const resultConsentRegime =
      result["portaloneapp:Proposal"]["portaloneapp:ConsentRegimes"][
        "portaloneapp:ConsentRegime"
      ];

    expect(resultScenarioNumber).toEqual(expectedScenarioNumber);
    expect(resultConsentRegime).toEqual(expectedConsentRegime);
  });
});
