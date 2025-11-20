import { getData } from "../analytics/utils";
import { Store } from "../store";

describe("Allow-list sanitisation: proposal.projectType and property.type", () => {
  test("preserves arrays for certain allow list answers", () => {
    const breadcrumb: Store.UserData = {
      data: {
        "proposal.projectType": ["not.dropKerb", "something.else"],
      },
    };

    const result = getData(breadcrumb);
    expect(result).toBeDefined();
    expect(Array.isArray(result!["proposal.projectType"])).toBe(true);
    expect(result!["proposal.projectType"]).toEqual([
      "not.dropKerb",
      "something.else",
    ]);
  });

  test("preserves strings for certain allow list answers", () => {
    const breadcrumb: Store.UserData = {
      data: {
        "application.type": "findOutIf",
      },
    };

    const result = getData(breadcrumb);
    expect(result).toBeDefined();
    expect(typeof result!["application.type"]).toBe("string");
    expect(result!["application.type"]).toEqual("findOutIf");
  });
});
