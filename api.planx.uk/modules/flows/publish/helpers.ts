import type { FlowGraph } from "@opensystemslab/planx-core/types";
import type { QueryMock } from "graphql-query-test-mock";
import type { VitestUtils } from "vitest";
import * as applicationTypes from "./service/applicationTypes.js";

export const mockGetFlowDataQuery = (
  queryMock: QueryMock,
  alteredFlow: FlowGraph,
  flowSlug: string,
) => {
  queryMock.mockQuery({
    name: "GetFlowData",
    matchOnVariables: false,
    data: {
      flow: {
        data: alteredFlow,
        slug: flowSlug,
        team_id: 1,
        team: {
          slug: "testing",
        },
        publishedFlows: [{ data: alteredFlow }],
      },
    },
  });
};

export const mockPublishFlow = (
  queryMock: QueryMock,
  alteredFlow: FlowGraph,
) => {
  queryMock.mockQuery({
    name: "PublishFlow",
    matchOnVariables: false,
    data: {
      publishedFlow: {
        data: alteredFlow,
      },
    },
  });
};

export const mockCheckStatApplicationTypesFn = (vi: VitestUtils) => {
  const publishMut = vi.spyOn(
    applicationTypes,
    "checkStatutoryApplicationTypes",
  );
  return publishMut;
};
