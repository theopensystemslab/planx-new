import { screen, waitFor } from "@testing-library/react";
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
    const handleSubmit = vi.fn();

    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ChecklistEditor text={"hi"} handleSubmit={handleSubmit} />
      </DndProvider>,
    );

    await waitFor(() => user.click(screen.getByLabelText("Expandable")));

    const groupedOptionsEditor = await screen.findByPlaceholderText(
      "Section Title",
    );
    expect(groupedOptionsEditor).toBeInTheDocument();
  });
});
