import { ComponentType } from "@opensystemslab/planx-core/types";
import {
  dataMerged,
  getFlowData,
  getFormattedEnvironment,
  isLiveEnv,
} from "./helpers";
import { queryMock } from "./tests/graphqlQueryMock";
import { userContext } from "./modules/auth/middleware";
import { getJWT } from "./tests/mockJWT";

describe("getEnvironment function", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  test("Production env", () => {
    process.env.NODE_ENV = "production";
    expect(getFormattedEnvironment()).toBe("Production");
  });

  test("Staging env", () => {
    process.env.NODE_ENV = "staging";
    expect(getFormattedEnvironment()).toBe("Staging");
  });

  test("Pizza env", () => {
    process.env.NODE_ENV = "pizza";
    process.env.API_URL_EXT = "https://api.123.planx.pizza/";
    expect(getFormattedEnvironment()).toBe("Pizza 123");
  });

  test("Development env", () => {
    process.env.NODE_ENV = "development";
    expect(getFormattedEnvironment()).toBe("Local");
  });
});

describe("isLiveEnv() function", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it("returns true for live environments", () => {
    ["pizza", "staging", "production"].forEach((env) => {
      process.env.NODE_ENV = env;
      expect(isLiveEnv()).toBe(true);
    });
  });

  it("returns false for other environments", () => {
    ["", undefined, "test", "development"].forEach((env) => {
      process.env.NODE_ENV = env;
      expect(isLiveEnv()).toBe(false);
    });
  });
});

describe("dataMerged() function", () => {
  const getStoreMock = jest.spyOn(userContext, "getStore");
  getStoreMock.mockReturnValue({
    user: {
      sub: "123",
      jwt: getJWT({ role: "teamEditor" }),
    },
  });

  beforeEach(() => {
    const unflattenedParent = {
      _root: {
        edges: ["Zj0ZKa0PwT", "Rur8iS88x3"],
      },
      "5yElH96W7I": {
        data: {
          text: "Option 2",
        },
        type: 200,
        edges: ["aMlxwR7ONH"],
      },
      Rur8iS88x3: {
        data: {
          color: "#EFEFEF",
          title: "End of the line",
          resetButton: false,
        },
        type: 8,
      },
      SShTHaRo2k: {
        data: {
          flowId: "child-id",
        },
        type: 310,
      },
      Zj0ZKa0PwT: {
        data: {
          text: "This is a question with many options",
        },
        type: 100,
        edges: ["c8hZwm0a9c", "5yElH96W7I", "UMsI68BuAy"],
      },
      c8hZwm0a9c: {
        data: {
          text: "Option 1",
        },
        type: 200,
        edges: ["SShTHaRo2k"],
      },
      aMlxwR7ONH: {
        type: 310,
        data: {
          flowId: "child-id",
        },
      },
      UMsI68BuAy: {
        type: 200,
        data: {
          text: "Option 3",
        },
      },
    };

    const invalidUnflattenedParent = {
      _root: {
        edges: ["Zj0ZKa0PwT", "Rur8iS88x3"],
      },
      "5yElH96W7I": {
        data: {
          text: "Option 2",
        },
        type: 200,
        edges: ["aMlxwR7ONH"],
      },
      Rur8iS88x3: {
        data: {
          color: "#EFEFEF",
          title: "End of the line",
          resetButton: false,
        },
        type: 8,
      },
      SShTHaRo2k: {
        data: {
          flowId: "unpublished-child-id",
        },
        type: 310,
      },
      Zj0ZKa0PwT: {
        data: {
          text: "This is a question with many options",
        },
        type: 100,
        edges: ["c8hZwm0a9c", "5yElH96W7I", "UMsI68BuAy"],
      },
      c8hZwm0a9c: {
        data: {
          text: "Option 1",
        },
        type: 200,
        edges: ["SShTHaRo2k"],
      },
      aMlxwR7ONH: {
        type: 310,
        data: {
          flowId: "unpublished-child-id",
        },
      },
      UMsI68BuAy: {
        type: 200,
        data: {
          text: "Option 3",
        },
      },
    };

    const unflattenedChild = {
      _root: {
        edges: ["sbDyJVsyXg"],
      },
      sbDyJVsyXg: {
        type: 100,
        data: {
          description: "<p>Hello there 👋</p>",
          text: "This is within the portal",
        },
      },
    };

    queryMock.mockQuery({
      name: "GetFlowData",
      variables: {
        id: "child-id",
      },
      data: {
        flow: {
          slug: "child-flow",
          data: unflattenedChild,
          team_id: 123,
          team: {
            slug: "testing",
          },
          publishedFlows: [
            {
              data: unflattenedChild,
            },
          ],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetFlowData",
      variables: {
        id: "parent-id",
      },
      data: {
        flow: {
          slug: "parent-flow",
          data: unflattenedParent,
          team_id: 123,
          team: {
            slug: "testing",
          },
        },
      },
    });

    queryMock.mockQuery({
      name: "GetFlowData",
      variables: {
        id: "unpublished-child-id",
      },
      data: {
        flow: {
          slug: "unpublished-child-flow",
          data: unflattenedChild,
          team_id: 123,
          team: {
            slug: "testing",
          },
          publishedFlows: [],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetFlowData",
      variables: {
        id: "invalid-parent-id",
      },
      data: {
        flow: {
          slug: "invalid-parent-flow",
          data: invalidUnflattenedParent,
          team_id: 123,
          team: {
            slug: "testing",
          },
        },
      },
    });
  });

  it("handles multiple external portal nodes", async () => {
    const result = await dataMerged("parent-id");
    const nodeTypes = Object.values(result).map((node) =>
      "type" in node ? node.type : undefined,
    );
    const areAllPortalsFlattened = !nodeTypes.includes(
      ComponentType.ExternalPortal,
    );

    // All external portals have been flattened / replaced
    expect(areAllPortalsFlattened).toBe(true);
  });

  it("throws an error when an external portal is not published", async () => {
    await expect(dataMerged("invalid-parent-id")).rejects.toThrow();
  });
});

describe("getFlowData() function", () => {
  it("throws an error if a flow is not found", async () => {
    queryMock.mockQuery({
      name: "GetFlowData",
      variables: {
        id: "child-id",
      },
      data: {
        flow: null,
      },
    });

    await expect(getFlowData("child-id")).rejects.toThrow();
  });
});
