import { getData } from "../analytics/utils";
import { Store } from "../store";

describe("Allow-list sanitisation: proposal.projectType and property.type", () => {
  test("converts numeric-keyed object -> array for proposal.projectType", () => {
    const breadcrumb: Store.UserData = {
      data: {
        "proposal.projectType": { "0": "not.dropKerb" },
      },
    };

    const result = getData(breadcrumb);
    expect(result).toBeDefined();
    expect(Array.isArray(result!["proposal.projectType"])).toBe(true);
    expect(result!["proposal.projectType"]).toEqual(["not.dropKerb"]);
  });

  test("preserves arrays for proposal.projectType", () => {
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

  test("converts numeric-keyed object -> array for property.type", () => {
    const breadcrumb: Store.UserData = {
      data: {
        "property.type": { "0": "residential" },
      },
    };

    const result = getData(breadcrumb);
    expect(result).toBeDefined();
    expect(Array.isArray(result!["property.type"])).toBe(true);
    expect(result!["property.type"]).toEqual(["residential"]);
  });

  test("preserves strings", () => {
    const breadcrumb: Store.UserData = {
      data: {
        "property.type": "residential",
      },
    };

    const result = getData(breadcrumb);
    expect(result).toBeDefined();
    expect(typeof result!["property.type"]).toBe("string");
    expect(result!["property.type"]).toEqual("residential");
  });
});
