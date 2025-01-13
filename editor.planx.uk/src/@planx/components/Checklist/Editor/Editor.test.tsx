import { screen, waitFor } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import userEvent, {
  PointerEventsCheckLevel,
} from "@testing-library/user-event";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { vi } from "vitest";

import { ChecklistEditor } from "./Editor";

vi.mock("lib/featureFlags", () => ({
  hasFeatureFlag: () => true,
}));

describe("Checklist editor component", () => {
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

    await waitFor(() => user.click(screen.getByLabelText("Expandable")));

    const groupedOptionsEditor = await screen.findByPlaceholderText(
      "Section Title",
    );
    expect(groupedOptionsEditor).toBeInTheDocument();
  });

  it.todo(
    "displays the options editor when the 'add new option' button is clicked",
    async () => {
      setup(
        <DndProvider backend={HTML5Backend}>
          <ChecklistEditor text={""} />
        </DndProvider>,
      );

      await waitFor(() =>
        userEvent.click(
          screen.getByRole("button", { name: /add new option/i }),
          {
            pointerEventsCheck: PointerEventsCheckLevel.Never,
          },
        ),
      );

      const optionsEditor = await screen.findByPlaceholderText("Option");
      expect(optionsEditor).toBeInTheDocument();
    },
  );

  it.todo("adds a new section when the 'add new group' button is clicked");

  it.todo(
    "shows the 'add exclusive or' button only when an option has been added already",
  );
});
