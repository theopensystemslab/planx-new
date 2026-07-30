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

import { PositionedNoteCard } from "./PositionedNoteCard";

const note: FlowNote = {
  id: "note-1",
  flowId: "flow-1",
  nodeId: null,
  placement: { parent: "_root", before: "node-a", parentIsContainer: true },
  text: "this note is positioned in between nodes",
  color: "#fffdb0",
  createdBy: 1,
  updatedBy: 1,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const longNote: FlowNote = {
  ...note,
  id: "note-2",
  text: "This note has a lot more text in it than usual, so long in fact that it must be truncated with ellipses and line clamping, the full version is visible in the note editor.",
};

const meta = {
  title: "Editor Components/Graph/Notes/PositionedNoteCard",
  component: PositionedNoteCard,
} satisfies Meta<typeof PositionedNoteCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const PositionedNoteCardDemo: React.FC<{ note: FlowNote }> = ({
  note: noteToRender,
}) => {
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
      <>
        <ul
          data-layout="top-down"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          <li className="card decision type-Question">
            <div className="card-wrapper">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- decorative mock of the real node markup */}
              <a>
                <span>Node A</span>
              </a>
            </div>
          </li>
          <li className="hanger">
            <button type="button" />
          </li>
          <PositionedNoteCard note={noteToRender} />
          <li className="hanger">
            <button type="button" />
          </li>
          <li className="card decision type-Question">
            <div className="card-wrapper">
              {/* eslint-disable-next-line jsx-a11y/anchor-is-valid -- decorative mock of the real node markup */}
              <a>
                <span>Node B</span>
              </a>
            </div>
          </li>
        </ul>
        <Outlet />
      </>
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
  args: { note },
  render: () => <PositionedNoteCardDemo note={note} />,
} satisfies Story;

export const LongText = {
  args: { note: longNote },
  render: () => <PositionedNoteCardDemo note={longNote} />,
} satisfies Story;
