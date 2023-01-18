import * as ReactNavi from "react-navi";

import { getBOPSParams } from "..";

const default_application_type = "lawfulness_certificate";

describe("application_type is set correctly based on flowName", () => {
  test("it defaults to `lawfulness_certificate` if we can't fetch current route", () => {
    jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
      () =>
        ({
          data: undefined,
        } as any)
    );

    const result = getBOPSParams({}, {}, {}, "session-123");
    expect(result.application_type).toEqual(default_application_type);
  });

  test("it sets to `lawfulness_certificate` for LDC services", () => {
    jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
      () =>
        ({
          data: {
            flowName: "apply for a lawful development certificate",
          },
        } as any)
    );

    const result = getBOPSParams({}, {}, {}, "session-123");
    expect(result.application_type).toEqual(default_application_type);
  });

  test("it sets to flowName for non-LDC services", () => {
    jest.spyOn(ReactNavi, "useCurrentRoute").mockImplementation(
      () =>
        ({
          data: {
            flowName: "apply for prior approval",
          },
        } as any)
    );

    const result = getBOPSParams({}, {}, {}, "session-123");
    expect(result.application_type).toEqual("Apply for prior approval");
  });
});
