import { fireEvent, screen, waitFor } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";

import { ChecklistEditor } from "./Editor";

const { getState } = useStore;

describe("Checklist editor component", () => {
  beforeEach(() => {
    getState().setUser({
      id: 1,
      firstName: "Editor",
      lastName: "Test",
      isPlatformAdmin: true,
      isAnalyst: true,
      email: "test@test.com",
      teams: [],
      jwt: "x.y.z",
    });
  });

  it("renders without error", () => {
    setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor text={""} />
      </DndProvider>,
    );
    expect(screen.getByText("Checklist")).toBeInTheDocument();
    expect(screen.getByText("add new option")).toBeInTheDocument();
  });

  it("displays the grouped checklist inputs when the 'expandable' toggle is clicked", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor text={""} />
      </DndProvider>,
    );

    await user.click(screen.getByLabelText("Expandable"));

    const groupedOptionsEditor =
      await screen.findByPlaceholderText("Section Title");
    expect(groupedOptionsEditor).toBeInTheDocument();
  });

  it("displays the options editor when the 'add new option' button is clicked", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor text={""} />
      </DndProvider>,
    );

    await user.click(screen.getByRole("button", { name: /add new option/i }));

    const optionsEditor = await screen.findByPlaceholderText("Option");
    expect(optionsEditor).toBeInTheDocument();
  });

  it("adds a new section when the 'add new group' button is clicked", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor text={""} />
      </DndProvider>,
    );

    await user.click(screen.getByLabelText("Expandable"));

    await screen.findByPlaceholderText("Section Title");

    await user.click(screen.getByRole("button", { name: /add new group/i }));

    expect(await screen.findAllByPlaceholderText("Section Title")).toHaveLength(
      2,
    );
  });

  it("shows the 'add exclusive or' button only when an option has been added already", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor text={""} />
      </DndProvider>,
    );

    expect(
      screen.queryByRole("button", { name: /add "or" option/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add new option/i }));

    expect(
      screen.queryByRole("button", { name: /add "or" option/i }),
    ).toBeInTheDocument();
  });

  it("shows an error if an exclusive 'or' option has been set alongside the 'all required' toggle", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor text={""} />
      </DndProvider>,
    );

    await user.click(screen.getByRole("button", { name: /add new option/i }));
    await user.type(screen.getByPlaceholderText("Option"), "First");

    await user.click(screen.getByRole("button", { name: /add "or" option/i }));
    await user.type(
      screen.getByPlaceholderText("Exclusive 'or' option"),
      "Second",
    );

    await user.click(screen.getByLabelText("All required"));

    fireEvent.submit(screen.getByTestId("checklistEditorForm"));

    await waitFor(() =>
      expect(
        screen.getByText(
          /Cannot configure exclusive "or" option alongside "all required" setting/,
        ),
      ).toBeInTheDocument()
    );
  }, 10_000);

  it("shows an error if 'never put to user' is toggled on without a data field", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor text={""} />
      </DndProvider>,
    );

    await user.click(
      screen.getByLabelText("Never put to user (default to blank automation)"),
    );

    fireEvent.submit(screen.getByTestId("checklistEditorForm"));

    await waitFor(() =>
      expect(
        screen.getByText(
          /Set a data field for the Checklist and all options but one when never putting to user/,
        ),
      ).toBeInTheDocument(),
    );
  });

  it.todo(
    "shows an error if 'never put to user' is toggled on and more than one option has a blank data field",
  );
});
