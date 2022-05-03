const { convertSlugToName, getResumeLink } = require("./utils");

describe("convertSlugToName util function", () => {
  it("should return the correct value", () => {
    const testData = [
      ["open-systems-lab", "Open Systems Lab"],
      ["lambeth", "Lambeth"],
    ];

    testData.forEach(([slug, name]) => {
      expect(convertSlugToName(slug)).toEqual(name);
    });
  });
});

describe("getResumeLink util function", () => {
  it("should return the correct value", () => {
    const session = { id: 123, address: "1 High Street", propertyType: "house" };
    const testCase = getResumeLink(session, "team", "flow");
    const expectedResult = "example.com/team/flow/preview?sessionId=123"
    expect(testCase).toEqual(expectedResult);
  });
});