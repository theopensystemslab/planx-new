import { getBOPSParams } from "..";

const default_application_type = "lawfulness_certificate";

describe("application_type is set correctly based on flowName", () => {
  test("it defaults to `lawfulness_certificate` if we can't fetch current route", () => {
    const result = getBOPSParams({
      breadcrumbs: {},
      flow: {},
      passport: {},
      sessionId: "session-123",
      flowName: undefined,
    });

    expect(result.application_type).toEqual(default_application_type);
  });

  test("it sets to `lawfulness_certificate` for LDC services", () => {
    const result = getBOPSParams({
      breadcrumbs: {},
      flow: {},
      passport: {},
      sessionId: "session-123",
      flowName: "apply for a lawful development certificate",
    });
    expect(result.application_type).toEqual(default_application_type);
  });

  test("it sets to flowName for non-LDC services", () => {
    const result = getBOPSParams({
      breadcrumbs: {},
      flow: {},
      passport: {},
      sessionId: "session-123",
      flowName: "apply for prior approval",
    });
    expect(result.application_type).toEqual("Apply for prior approval");
  });
});
