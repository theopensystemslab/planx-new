import { XMLValidator } from "fast-xml-parser";

import { Store } from "./../../../../pages/FlowEditor/lib/store/index";
import { UniformInstance } from "./applicationType";
import { makeXmlString } from "./xml";

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
