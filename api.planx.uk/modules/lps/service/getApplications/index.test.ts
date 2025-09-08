import type { Application } from "./types.js";
import { generateResumeLink } from "./index.js";

describe("generateResumeLink() helper function", () => {
  it("generates a valid URL for teams with a custom subdomain", () => {
    const expected =
      "https://planningservices.mycouncil.gov/my-flow?sessionId=123&email=test%40example.com";
    const actual = generateResumeLink(
      {
        id: "123",
        service: {
          slug: "my-flow",
          team: {
            domain: "planningservices.mycouncil.gov",
          },
        },
      } as Application,
      "test@example.com",
    );

    expect(actual).toEqual(expected);
  });

  it("generates a valid URL for teams without a custom subdomain", () => {
    const expected =
      "https://www.example.com/my-team/my-flow/published?sessionId=123&email=test%40example.com";
    const actual = generateResumeLink(
      {
        id: "123",
        service: {
          slug: "my-flow",
          team: {
            slug: "my-team",
            domain: null,
          },
        },
      } as Application,
      "test@example.com",
    );

    expect(actual).toEqual(expected);
  });
});
