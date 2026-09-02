import { fireEvent, screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "test/utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Hanger from "./Hanger";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useParams: () => ({ team: "test-team", flow: "test-flow" }),
    useNavigate: () => vi.fn(),
  };
});

const renderHanger = (props: React.ComponentProps<typeof Hanger>) =>
  setup(
    <DndProvider backend={HTML5Backend}>
      <ol>
        <Hanger {...props} />
      </ol>
    </DndProvider>,
  );

beforeEach(() => {
  useStore.setState({
    flow: {},
    orderedFlow: undefined,
    isTemplatedFrom: false,
    showNotes: true,
    user: {
      id: 1,
      isPlatformAdmin: true,
      isAnalyst: false,
      teams: [],
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      defaultTeamId: null,
    } as any,
    contextMenuSource: null,
    contextMenuPosition: null,
  });
});

describe("hanger interactions", () => {
  it("opens the component selector on click", async () => {
    await renderHanger({ parent: "root", before: "node-a" });

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByTestId("add-component-modal")).toBeInTheDocument();
  });

  it("sets the context menu source to hanger on right-click", async () => {
    await renderHanger({ parent: "root", before: "node-a" });

    fireEvent.contextMenu(screen.getByRole("button"));

    expect(useStore.getState().contextMenuSource).toBe("hanger");
  });
});
