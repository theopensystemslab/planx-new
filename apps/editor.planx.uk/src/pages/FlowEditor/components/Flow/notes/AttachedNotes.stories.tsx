import "pages/FlowEditor/floweditor.scss";

import type { Meta, StoryObj } from "@storybook/tanstack-react";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from "@tanstack/react-router";
import type { FlowNote } from "hooks/data/useFlowNotes";
import React from "react";

import { AttachedNotes } from "./AttachedNotes";
import { FlowNotesContext } from "./FlowNotesContext";

const notes: FlowNote[] = [
  {
    positionId: "note-1",
    contentId: "note-content-1",
    flowId: "flow-1",
    nodeId: "node-a",
    placement: null,
    text: "This is a note which is attached to a node",
    color: "#fffdb0",
    createdBy: 1,
    updatedBy: 1,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

const longNotes: FlowNote[] = [
  {
    ...notes[0],
    positionId: "note-2",
    contentId: "note-content-2",
    text: "This note has a lot more text in it than usual, so long in fact that it must be truncated with ellipses and line clamping, the full version is visible in the note editor.",
  },
];

const meta = {
  title: "Editor Components/Graph/Notes/AttachedNotes",
  component: AttachedNotes,
} satisfies Meta<typeof AttachedNotes>;

export default meta;

type Story = StoryObj<typeof meta>;

const AttachedNotesDemo: React.FC<{
  notes: FlowNote[];
  clonedContentIds?: Set<string>;
}> = ({ notes: notesToRender, clonedContentIds = new Set() }) => {
  // disable the edit modal by registering a no-op child route for it
  const rootRoute = createRootRoute();
  const authenticatedRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: "_authenticated",
  });
  const flowRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "app/$team/$flow",
    component: () => (
      <FlowNotesContext.Provider
        value={{
          attached: new Map([["node-a", notesToRender]]),
          positioned: new Map(),
          loading: false,
          clonedContentIds,
        }}
      >
        <ul
          style={{
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          <li className="card decision type-Question">
            <div className="card-wrapper">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- decorative mock of the real node markup */}
              <a>
                <span>A node with an attached note</span>
              </a>
              <AttachedNotes nodeId="node-a" />
            </div>
          </li>
        </ul>
        <Outlet />
      </FlowNotesContext.Provider>
    ),
  });
  const noteEditRoute = createRoute({
    getParentRoute: () => flowRoute,
    path: "note/$id/edit",
    component: () => null,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([
      authenticatedRoute.addChildren([flowRoute.addChildren([noteEditRoute])]),
    ]),
    history: createMemoryHistory({
      initialEntries: ["/app/test-team/test-flow"],
    }),
  });

  return <RouterProvider router={router} />;
};

export const Default = {
  args: { nodeId: "node-a" },
  render: () => <AttachedNotesDemo notes={notes} />,
} satisfies Story;

export const LongText = {
  args: { nodeId: "node-a" },
  render: () => <AttachedNotesDemo notes={longNotes} />,
} satisfies Story;

export const Cloned = {
  args: { nodeId: "node-a" },
  render: () => (
    <AttachedNotesDemo
      notes={notes}
      clonedContentIds={new Set(["note-content-1"])}
    />
  ),
} satisfies Story;
