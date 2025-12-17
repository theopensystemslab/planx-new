import type * as planxCore from "@opensystemslab/planx-core";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { act, screen, waitFor } from "@testing-library/react";
import { FullStore, useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import ConfirmationComponent from "./Public";

const { getState, setState } = useStore;

let initialState: FullStore;

vi.mock("@opensystemslab/planx-core", async (importOriginal) => {
  const actual = await importOriginal<typeof planxCore>();
  return {
    ...actual,
    CoreDomainClient: vi.fn().mockImplementation(() => ({
      export: {
        csvData: () => vi.fn(),
      },
    })),
  };
});

it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <ConfirmationComponent
      heading="heading"
      description="description"
      nextSteps={[
        { title: "title1", description: "description1" },
        { title: "title2", description: "description2" },
        { title: "title3", description: "description3" },
      ]}
      moreInfo="more info"
      contactInfo="contact info"
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

describe("Confirmation component", () => {
  const handleSubmit = vi.fn();

  beforeAll(() => (initialState = getState()));

  afterEach(() => waitFor(() => setState(initialState)));

  it("hides the 'Continue' button if it's the final card in the flow", () => {
    act(() =>
      setState({
        flow: {
          _root: { edges: ["Send", "Confirmation"] },
          Send: { type: TYPES.Send },
          Confirmation: { type: TYPES.Confirmation },
        },
        breadcrumbs: { Send: { auto: false } },
      }),
    );

    expect(getState().upcomingCardIds()).toEqual(["Confirmation"]);
    expect(getState().isFinalCard()).toEqual(true);

    const { user } = setup(
      <ConfirmationComponent
        heading="heading"
        description="description"
        nextSteps={[
          { title: "title1", description: "description1" },
          { title: "title2", description: "description2" },
          { title: "title3", description: "description3" },
        ]}
        moreInfo="more info"
        contactInfo="contact info"
        handleSubmit={handleSubmit}
      />,
    );

    expect(screen.queryByText("Continue")).not.toBeInTheDocument();
  });

  it("shows the 'Continue' button if there are nodes following it", () => {
    act(() =>
      setState({
        flow: {
          _root: { edges: ["Send", "Confirmation", "Feedback", "Notice"] },
          Send: { type: TYPES.Send },
          Confirmation: { type: TYPES.Confirmation },
          Feedback: { type: TYPES.Feedback },
          Notice: { type: TYPES.Notice },
        },
        breadcrumbs: { Send: { auto: false } },
      }),
    );

    expect(getState().upcomingCardIds()).toEqual([
      "Confirmation",
      "Feedback",
      "Notice",
    ]);
    expect(getState().isFinalCard()).toEqual(false);

    const { user } = setup(
      <ConfirmationComponent
        heading="heading"
        description="description"
        nextSteps={[
          { title: "title1", description: "description1" },
          { title: "title2", description: "description2" },
          { title: "title3", description: "description3" },
        ]}
        moreInfo="more info"
        contactInfo="contact info"
        handleSubmit={handleSubmit}
      />,
    );

    expect(screen.queryByText("Continue")).toBeInTheDocument();
  });
});
