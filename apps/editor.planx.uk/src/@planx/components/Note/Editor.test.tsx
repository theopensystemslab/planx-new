import { fireEvent, screen } from "@testing-library/react";
import { useStore } from "pages/FlowEditor/lib/store";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "test/utils";

import NoteComponent from "./Editor";

const { setState } = useStore;

describe("Note component editor modal", () => {
  it("renders", async () => {
    await setup(
      <DndProvider backend={HTML5Backend}>
        <NoteComponent id="test" />
      </DndProvider>,
    );

    expect(screen.getByPlaceholderText("Note")).toBeInTheDocument();
    expect(screen.getByLabelText("Tag this component")).toBeInTheDocument();
  });

  it("requires text", async () => {
    const handleSubmit = vi.fn();
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <NoteComponent id="test" handleSubmit={handleSubmit} />
      </DndProvider>,
    );

    fireEvent.submit(screen.getByTestId("noteEditorForm"));

    expect(
      await screen.findByText("Error: text is a required field"),
    ).toBeVisible();
  });
});

describe("Note component editor modal in a soure template", () => {
  beforeEach(() => {
    setState({
      isTemplate: true,
      user: {
        id: 1,
        firstName: "Editor",
        lastName: "Test",
        isPlatformAdmin: true,
        isAnalyst: false,
        email: "test@test.com",
        teams: [],
        defaultTeamId: null,
      },
      jwt: "x.y.z",
    });
  });

  it("does not display templated node config", async () => {
    await setup(
      <DndProvider backend={HTML5Backend}>
        <NoteComponent id="test" />
      </DndProvider>,
    );

    expect(screen.getByPlaceholderText("Note")).toBeInTheDocument();
    expect(screen.getByLabelText("Tag this component")).toBeInTheDocument();

    expect(screen.queryByTitle("Templates")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Allow edits")).not.toBeInTheDocument();
  });
});
