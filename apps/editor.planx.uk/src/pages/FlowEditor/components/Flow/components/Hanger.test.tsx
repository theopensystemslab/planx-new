import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { act, fireEvent, screen } from "@testing-library/react";
import type { Store } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
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

describe("hangers in a templated flow", () => {
  const templatedFlow: Store.Flow = {
    _root: { edges: ["lockedQuestion", "folder"] },
    lockedQuestion: {
      type: TYPES.Question,
      data: { text: "Not customisable" },
      edges: ["lockedAnswer"],
    },
    lockedAnswer: { type: TYPES.Answer, data: { text: "Locked answer" } },
    folder: {
      type: TYPES.InternalPortal,
      data: { text: "Customisable folder", isTemplatedNode: true },
      edges: ["checklist"],
    },
    checklist: {
      type: TYPES.Checklist,
      data: { text: "Pick some options" },
      edges: ["existingAnswer"],
    },
    existingAnswer: { type: TYPES.Answer, data: { text: "Existing answer" } },
  };

  const getHangerListItem = () => screen.getByRole("button").closest("li");

  beforeEach(() => {
    useStore.setState({ flow: templatedFlow, isTemplatedFrom: true });
  });

  it("is hidden outside of a customisable folder", async () => {
    await renderHanger({ parent: "lockedAnswer" });

    expect(getHangerListItem()).toHaveClass("hidden");
  });

  it("is visible within a customisable folder", async () => {
    await renderHanger({ parent: "existingAnswer" });

    expect(getHangerListItem()).not.toHaveClass("hidden");
  });

  it("is visible on a new branch added to a customisable folder, without a refresh", async () => {
    await renderHanger({ parent: "newAnswer" });

    // A ShareDB sync adds a new branch to the checklist
    act(() =>
      useStore.setState({
        flow: {
          ...templatedFlow,
          checklist: {
            ...templatedFlow.checklist,
            edges: ["existingAnswer", "newAnswer"],
          },
          newAnswer: { type: TYPES.Answer, data: { text: "New answer" } },
        },
      }),
    );

    expect(getHangerListItem()).not.toHaveClass("hidden");
  });
});
