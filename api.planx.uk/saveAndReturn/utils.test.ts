import { Team } from "../types";
import { convertSlugToName, getResumeLink } from "./utils";

describe("convertSlugToName util function", () => {
  it("should return the correct value", () => {
    const testData = [
      ["open-systems-lab", "Open systems lab"],
      ["lambeth", "Lambeth"],
    ];

    testData.forEach(([slug, name]) => {
      expect(convertSlugToName(slug)).toEqual(name);
    });
  });
});

describe("getResumeLink util function", () => {
  it("should return the correct value for a custom domain", () => {
    const session = {
      id: "123",
      address: "1 High Street",
      propertyType: "house",
    };
    const testCase = getResumeLink(
      session,
      { domain: "custom-domain.com", slug: "team" } as Team,
      "flow",
    );
    const expectedResult = "https://custom-domain.com/flow?sessionId=123";
    expect(testCase).toEqual(expectedResult);
  });

  it("should return the correct fallback value", () => {
    const session = {
      id: "123",
      address: "1 High Street",
      propertyType: "house",
    };
    const testCase = getResumeLink(session, { slug: "team" } as Team, "flow");
    const expectedResult = "example.com/team/flow/preview?sessionId=123";
    expect(testCase).toEqual(expectedResult);
  });
});
