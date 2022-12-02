import {
  getPreviouslySubmittedData,
  useStagingUrlIfTestApplication,
} from "./utils";

describe("useStagingUrlIfTestApplication()", () => {
  test("replaces URL if test user", () => {
    const url = useStagingUrlIfTestApplication({
      data: {
        "applicant.name.first": "Test ",
        "applicant.name.last": "test",
      },
    })("https://api.editor.planx.uk/bops/southwark");

    expect(url).toStrictEqual("https://api.editor.planx.dev/bops/southwark");
  });

  test("doesn't replace URL if not a test user", () => {
    const url = useStagingUrlIfTestApplication({
      data: {
        applicant: {
          "name.first": "Regular",
          "name.last": "User",
        },
      },
    })("https://api.editor.planx.uk/pay");

    expect(url).toStrictEqual("https://api.editor.planx.uk/pay");
  });

  test("returns correct result providing an id", () => {
    const data = {
      id: "some-id",
      previouslySubmittedData: {
        data: {
          "some-id": 1234,
          randomAttribute: "abcd",
        },
      },
    };

    expect(getPreviouslySubmittedData(data)).toEqual(1234);
  });

  test("returns correct result providing an fn value", () => {
    const data = {
      id: "some-id",
      fn: "data-field",
      previouslySubmittedData: {
        data: {
          "data-field": 1234,
          randomAttribute: "abcd",
        },
      },
    };

    expect(getPreviouslySubmittedData(data)).toEqual(1234);
  });
});
