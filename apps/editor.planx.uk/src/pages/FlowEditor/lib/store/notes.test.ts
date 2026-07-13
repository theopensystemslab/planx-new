import { graphql, HttpResponse } from "msw";
import server from "test/mockServer";
import { beforeEach, describe, expect, it } from "vitest";

import { useStore } from ".";

beforeEach(() => {
  useStore.setState({
    id: "flow-1",
    jwt: "test-jwt",
    user: {
      id: 42,
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      isPlatformAdmin: false,
      isAnalyst: false,
      defaultTeamId: null,
      teams: [],
    } as any,
  });
});

describe("createFlowNote", () => {
  it("sets created_by and updated_by from the current user", async () => {
    let capturedObject: any;

    server.use(
      graphql.mutation("CreateFlowNote", ({ variables }) => {
        capturedObject = variables.object;
        return HttpResponse.json({
          data: { insert_flow_notes_one: { id: "new-note-id" } },
        });
      }),
    );

    const id = await useStore
      .getState()
      .createFlowNote({ nodeId: "node-a", text: "Hello" });

    expect(id).toBe("new-note-id");
    expect(capturedObject).toMatchObject({
      flow_id: "flow-1",
      node_id: "node-a",
      placement: null,
      text: "Hello",
      created_by: 42,
      updated_by: 42,
    });
  });
});
