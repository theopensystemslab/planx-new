import { ComponentType } from "@opensystemslab/planx-core/types";

import { queryMock } from "../tests/graphqlQueryMock.js";
import { dataMerged, sanitiseNotes } from "./dataMerged.js";
import {
  draftNestedFlowA,
  draftNestedFlowB,
  draftParentFlow,
  flattenedParentFlow,
  flattenedParentFlowDraftOnly,
  publishedNestedFlowA,
  publishedNestedFlowB,
} from "./mocks/mergedFlowData.js";

describe("dataMerged() function", () => {
  beforeEach(() => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "parent-flow",
      },
      data: {
        flow: {
          data: draftParentFlow,
          slug: "parent-flow",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: flattenedParentFlow }],
        },
      },
    });
  });

  it("flattens published nested flows by default", async () => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "nested-a",
      },
      data: {
        flow: {
          data: draftNestedFlowA,
          slug: "nested-a",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [
            {
              data: publishedNestedFlowA,
              createdAt: "2026-05-15T02:12:32.889893+00:00",
              publisherId: 1,
              id: 9,
              summary: "Testing a",
            },
          ],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetMostRecentPublishedFlowVersion",
      matchOnVariables: true,
      variables: {
        id: "nested-a",
      },
      data: {
        flow: {
          publishedFlows: [{ id: 9 }],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "nested-b",
      },
      data: {
        flow: {
          data: draftNestedFlowB,
          slug: "nested-b",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [
            {
              data: publishedNestedFlowB,
              createdAt: "2026-05-15T02:12:48.760153+00:00",
              publisherId: 1,
              id: 10,
              summary: "Testing b",
            },
          ],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetMostRecentPublishedFlowVersion",
      matchOnVariables: true,
      variables: {
        id: "nested-b",
      },
      data: {
        flow: {
          publishedFlows: [{ id: 10 }],
        },
      },
    });

    const result = await dataMerged("parent-flow");
    expect(result).toEqual(flattenedParentFlow);
  });

  it("flattens draft nested flows when draftDataOnly is set to true", async () => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "nested-a",
      },
      data: {
        flow: {
          data: draftNestedFlowA,
          slug: "nested-a",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: publishedNestedFlowA }],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "nested-b",
      },
      data: {
        flow: {
          data: draftNestedFlowB,
          slug: "nested-b",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: publishedNestedFlowB }],
        },
      },
    });

    const result = await dataMerged("parent-flow", false, true);
    expect(result).toEqual(flattenedParentFlowDraftOnly);
  });

  it("only fetches a unique flow reference once even if it is nested in multiple locations", async () => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "nested-a",
      },
      data: {
        flow: {
          data: draftNestedFlowA,
          slug: "nested-a",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [
            {
              data: publishedNestedFlowA,
            },
          ],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "nested-b",
      },
      data: {
        flow: {
          data: draftNestedFlowB,
          slug: "nested-b",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [
            {
              data: publishedNestedFlowB,
            },
          ],
        },
      },
    });

    await dataMerged("parent-flow");
    expect(queryMock.getCalls().length).toEqual(3); // 3 = 1x parent-flow, 1x nested-a (even though nested 2 unique locations), 1x nested-b
  });

  it("converts all external portal node types to internal types on flatten", async () => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "nested-a",
      },
      data: {
        flow: {
          data: draftNestedFlowA,
          slug: "nested-a",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [
            {
              data: publishedNestedFlowA,
            },
          ],
        },
      },
    });

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "nested-b",
      },
      data: {
        flow: {
          data: draftNestedFlowB,
          slug: "nested-b",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [
            {
              data: publishedNestedFlowB,
            },
          ],
        },
      },
    });

    const result = await dataMerged("parent-flow");
    const nodeTypes = Object.values(result).map((node) =>
      "type" in node ? node.type : undefined,
    );

    expect(nodeTypes.includes(ComponentType.ExternalPortal)).toBe(false);
    expect(nodeTypes.includes(ComponentType.InternalPortal)).toBe(true);
  });

  it("throws an error when an external portal is not published and draftDataOnly is falsey", async () => {
    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "nested-a",
      },
      data: {
        flow: {
          data: draftNestedFlowA,
          slug: "nested-a",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [], // a is not published, but b is
        },
      },
    });

    queryMock.mockQuery({
      name: "GetFlowData",
      matchOnVariables: true,
      variables: {
        id: "nested-b",
      },
      data: {
        flow: {
          data: draftNestedFlowB,
          slug: "nested-b",
          teamId: 1,
          team: {
            slug: "testing",
          },
          publishedFlows: [{ data: publishedNestedFlowB }],
        },
      },
    });

    await expect(dataMerged("parent-flow")).rejects.toThrow();
  });
});

describe("sanitiseNotes() function", () => {
  it("removes all data associated with Note component types but preserves their position", () => {
    const sanitisedFlow = sanitiseNotes(draftParentFlow);

    expect(sanitisedFlow["n0t3"]).not.toHaveProperty("data");
    expect(sanitisedFlow["_root"].edges).toContain("n0t3");
    expect(sanitisedFlow["n0t3"]).toEqual({ type: ComponentType.Note });
  });

  it("removes internal notes prop from any component type which sets it", () => {
    const sanitisedFlow = sanitiseNotes(draftParentFlow);

    expect(sanitisedFlow["45vie6vizK"]).toHaveProperty("data");
    expect(sanitisedFlow["45vie6vizK"]).not.toHaveProperty("notes");

    expect(sanitisedFlow["DQRnJfTvkq"]).toHaveProperty("data");
    expect(sanitisedFlow["DQRnJfTvkq"]).not.toHaveProperty("notes");
  });
});
