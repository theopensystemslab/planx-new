import { act, screen } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";
import { axe } from "vitest-axe";

import { ReadMePage } from "./ReadMePage";
import { ReadMePageProps } from "./types";

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

const longInput =
  "A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my who"; // 122 characters

describe("Read Me Page component", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    getState().setUser({
      id: 1,
      firstName: "Editor",
      lastName: "Test",
      isPlatformAdmin: true,
      email: "test@test.com",
      teams: [],
      jwt: "x.y.z",
    });
  });

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

  it("displays an error if the service description is longer than 120 characters", async () => {
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <ReadMePage {...defaultProps} />
      </DndProvider>
    );

    expect(getState().flowSummary).toBe("");

    const serviceSummaryInput = screen.getByPlaceholderText("Description");

    await user.type(serviceSummaryInput, longInput);

    expect(
      await screen.findByText("You have 2 characters too many")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      screen.getByText("Service description must be 120 characters or less")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reset changes" })); // refreshes page and refetches data
    expect(getState().flowSummary).toBe(""); // db has not been updated
  });

  it("displays data in the fields if there is already flow information in the database", async () => {
    await act(async () =>
      setState({
        flowSummary: "This flow summary is in the db already",
      })
    );

    setup(
      <DndProvider backend={HTML5Backend}>
        <ReadMePage {...defaultProps} />
      </DndProvider>
    );

    expect(
      screen.getByText("This flow summary is in the db already")
    ).toBeInTheDocument();
  });

  it.todo("displays an error toast if there is a server-side issue"); // waiting for PR 4019 to merge first

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
