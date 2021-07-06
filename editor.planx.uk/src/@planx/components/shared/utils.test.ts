import { useStagingUrlIfTestApplication } from "./utils";

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
        "applicant.name.first": "Regular",
        "applicant.name.last": "User",
      },
    })("https://api.editor.planx.uk/pay");

    expect(url).toStrictEqual("https://api.editor.planx.uk/pay");
  });
});
