import { ComponentType } from "@opensystemslab/planx-core/types";
import {
  dataMerged,
  getFlowData,
  getFormattedEnvironment,
  isLiveEnv,
} from "./helpers";
import { queryMock } from "./tests/graphqlQueryMock";
import {
  childFlow,
  draftParentFlow,
  flattenedParentFlow,
} from "./tests/mocks/validateAndPublishMocks";

describe("getFormattedEnvironment() function", () => {
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
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "parent-flow-with-external-portal",
      },
      data: {
        flow: {
          data: draftParentFlow,
          slug: "parent-flow",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: flattenedParentFlow }],
        },
      },
    });
  });

  it("flattens published external portal nodes by overwriting their type", async () => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "child-flow-id",
      },
      data: {
        flow: {
          data: childFlow,
          slug: "child-flow",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: childFlow }],
        },
      },
    });

    const result = await dataMerged("parent-flow-with-external-portal");
    const nodeTypes = Object.values(result).map((node) =>
      "type" in node ? node.type : undefined,
    );

    expect(nodeTypes.includes(ComponentType.ExternalPortal)).toBe(false);
  });

  it("throws an error when an external portal is not published", async () => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "child-flow-id",
      },
      data: {
        flow: {
          data: childFlow,
          slug: "child-flow",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [],
        },
      },
    });

    await expect(
      dataMerged("parent-flow-with-external-portal"),
    ).rejects.toThrow();
  });

  it("flattens any published or unpublished external portal nodes when isDraftData only is set to true", async () => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "child-flow-id",
      },
      data: {
        flow: {
          data: childFlow,
          slug: "child-flow",
          team_id: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [],
        },
      },
    });

    const result = await dataMerged(
      "parent-flow-with-external-portal",
      {},
      false,
      true,
    );
    expect(result).toEqual(flattenedParentFlow);
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
