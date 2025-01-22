import { act, screen } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import { ReadMePage, ReadMePageProps } from "./ReadMePage";

const { getState, setState } = useStore;

let initialState: FullStore;

const defaultProps = {
  flowSlug: "find-out-if-you-need-planning-permission",
  flowInformation: {
    status: "online",
    description: "A long description of a service",
    summary: "A short blurb",
    limitations: "",
    settings: {},
  },
} as ReadMePageProps;

describe("Read Me Page component", () => {
  beforeAll(() => (initialState = getState()));

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("renders and submits data without an error", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ReadMePage {...defaultProps} />
      </DndProvider>
    );

    expect(getState().flowSummary).toBe("");

    const serviceSummaryInput = screen.getByPlaceholderText("Description");

    await user.type(serviceSummaryInput, "a summary");

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByText("a summary")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reset changes" })); // refreshes page and refetches data

    expect(getState().flowSummary).toEqual("a summary");
    expect(screen.getByText("a summary")).toBeInTheDocument();
  });

  it.todo(
    "throws an error if the service description is longer than 120 characters"
  );

  it.todo(
    "displays data in the fields if there is already flow information in the database"
  );

  it.todo(
    "counts down the number of characters remaining on the service description field"
  );

  it.todo("displays an error toast if there is a server-side issue");

  it("should not have any accessibility violations", async () => {
    const { container } = setup(
      <DndProvider backend={HTML5Backend}>
        <ReadMePage {...defaultProps} />
      </DndProvider>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
