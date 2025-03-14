import type { Team } from "@opensystemslab/planx-core/types";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import type { LowCalSession, LowCalSessionData } from "../../../types.js";
import {
  getResumeLink,
  getSessionDetails,
  setupEmailEventTriggers,
} from "./utils.js";

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
    const expectedResult =
      "https://www.example.com/team/flow/published?sessionId=123";
    expect(testCase).toEqual(expectedResult);
  });
});

describe("getSessionDetails() util function", () => {
  it("sets defaults for values not in the session", async () => {
    const result = await getSessionDetails({
      data: { id: "flowId", passport: { data: {} }, breadcrumbs: {} },
      id: "abc123",
      created_at: "2023-01-01",
      submitted_at: "2023-02-02",
      has_user_saved: true,
    } as LowCalSession);

    expect(result.address).toEqual("Address not submitted");
    expect(result.projectType).toEqual("Project type not submitted");
  });

  it("defaults to address title if no single line address is present", async () => {
    const sessionData: LowCalSessionData = {
      id: "flowId",
      passport: {
        data: {
          _address: {
            title: "Address title",
          },
        },
      },
      breadcrumbs: {},
    };

    const result = await getSessionDetails({
      data: sessionData,
      id: "abc123",
      created_at: "2023-01-01",
      submitted_at: "2023-02-02",
      has_user_saved: true,
    } as LowCalSession);

    expect(result.address).toEqual("Address title");
  });
});

describe("setupEmailEventTriggers util function", () => {
  it("handles GraphQL errors", async () => {
    queryMock.mockQuery({
      name: "SetupEmailNotifications",
      data: {
        session: {
          id: "123",
          hasUserSaved: true,
        },
      },
      variables: {
        sessionId: "123",
      },
      graphqlErrors: [
        {
          message: "Something went wrong",
        },
      ],
    });

    await expect(setupEmailEventTriggers("123")).rejects.toThrow();
  });
});
