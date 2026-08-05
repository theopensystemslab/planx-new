import { screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import server from "test/mockServer";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContextMenu } from "./ContextMenu";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useParams: () => ({ team: "test-team", flow: "test-flow" }),
    useNavigate: () => vi.fn(),
  };
});

beforeEach(() => {
  localStorage.clear();
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
    contextMenuPosition: { mouseX: 10, mouseY: 10 },
    contextMenuRelationships: {},
    contextMenuSource: null,
    flow: {},
  });
});

describe("positioned-note context menu", () => {
  it("offers Clone and Copy for a right-clicked note", async () => {
    useStore.setState({
      contextMenuSource: "positioned-note",
      contextMenuRelationships: { self: "position-1", contentId: "content-1" },
    });

    await setup(<ContextMenu />);

    expect(
      screen.getByRole("menuitem", { name: /clone/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: /^copy$/i }),
    ).toBeInTheDocument();
  });

  it("clones using the note's shared content id, not its position id", async () => {
    useStore.setState({
      contextMenuSource: "positioned-note",
      contextMenuRelationships: { self: "position-1", contentId: "content-1" },
    });

    const { user } = await setup(<ContextMenu />);
    await user.click(screen.getByRole("menuitem", { name: /clone/i }));

    expect(localStorage.getItem("clonedFlowNoteId")).toBe("content-1");
  });

  it("copies using the note's shared content id, not its position id", async () => {
    let queriedId: string | undefined;
    server.use(
      graphql.query("GetFlowNoteContent", ({ variables }) => {
        queriedId = variables.id;
        return HttpResponse.json({
          data: {
            noteContent: { text: "hi", color: "#fffdb0" },
          },
        });
      }),
    );

    useStore.setState({
      contextMenuSource: "positioned-note",
      contextMenuRelationships: { self: "position-1", contentId: "content-1" },
    });

    const { user } = await setup(<ContextMenu />);
    await user.click(screen.getByRole("menuitem", { name: /^copy$/i }));

    expect(queriedId).toBe("content-1");
    expect(JSON.parse(localStorage.getItem("copiedFlowNote")!)).toEqual({
      text: "hi",
      color: "#fffdb0",
    });
  });
});

describe("hanger context menu - paste note", () => {
  it("disables 'Paste note' when nothing is cloned or copied", async () => {
    useStore.setState({
      contextMenuSource: "hanger",
      contextMenuRelationships: { parent: "_root" },
    });

    await setup(<ContextMenu />);

    expect(
      screen.getByRole("menuitem", { name: /paste note/i }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("pastes a clone (referencing the shared content) when a note has been cloned", async () => {
    let capturedObject: any;
    server.use(
      graphql.mutation("CreateFlowNotePosition", ({ variables }) => {
        capturedObject = variables.object;
        return HttpResponse.json({
          data: { insertedNotePosition: { id: "new-position-id" } },
        });
      }),
    );

    localStorage.setItem("clonedFlowNoteId", "content-1");
    useStore.setState({
      contextMenuSource: "hanger",
      contextMenuRelationships: { parent: "_root" },
    });

    const { user } = await setup(<ContextMenu />);
    await user.click(screen.getByRole("menuitem", { name: /paste note/i }));

    expect(capturedObject).toMatchObject({ note_id: "content-1" });
    expect(capturedObject.note).toBeUndefined();
  });

  it("pastes a copy (independent content) when a note has been copied", async () => {
    let capturedObject: any;
    server.use(
      graphql.mutation("CreateFlowNotePosition", ({ variables }) => {
        capturedObject = variables.object;
        return HttpResponse.json({
          data: { insertedNotePosition: { id: "new-position-id" } },
        });
      }),
    );

    localStorage.setItem(
      "copiedFlowNote",
      JSON.stringify({ text: "hi", color: "#fffdb0" }),
    );
    useStore.setState({
      contextMenuSource: "hanger",
      contextMenuRelationships: { parent: "_root" },
    });

    const { user } = await setup(<ContextMenu />);
    await user.click(screen.getByRole("menuitem", { name: /paste note/i }));

    expect(capturedObject).toMatchObject({
      note: { data: { text: "hi", color: "#fffdb0" } },
    });
    expect(capturedObject.note_id).toBeUndefined();
  });
});
