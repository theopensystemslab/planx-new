import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TYPES } from "planx-nodes/types";
import React from "react";

import InternalPortalForm from "./InternalPortal";

describe("adding an internal portal", () => {
  test("creating a new internal portal", async () => {
    const handleSubmit = jest.fn();

    render(
      <InternalPortalForm
        flows={[{ id: "ignore", text: "ignore" }]}
        handleSubmit={handleSubmit}
      />
    );

    const flowSelect = screen.getByTestId("flowId");

    expect(flowSelect).toHaveValue("");
    expect(flowSelect).toBeEnabled();

    userEvent.type(
      screen.getByPlaceholderText("Portal name"),
      "new internal portal"
    );

    expect(flowSelect).toBeDisabled();

    await waitFor(() => {
      fireEvent.submit(screen.getByTestId("form"));
    });

    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.InternalPortal,
      data: {
        flowId: "", // will be removed when saving the data
        text: "new internal portal",
      },
    });
  });

  test("selecting an existing internal portal", async () => {
    const handleSubmit = jest.fn();

    render(
      <InternalPortalForm
        flows={[{ id: "portal", text: "portal" }]}
        handleSubmit={handleSubmit}
      />
    );

    const dropdown = screen.queryByTestId("flowId");

    expect(dropdown).toHaveValue("");

    userEvent.selectOptions(dropdown, "portal");

    await waitFor(() => {
      fireEvent.submit(screen.getByTestId("form"));
    });

    expect(handleSubmit).toHaveBeenCalledWith("portal");
  });

  test("if text and flowId are set, only flowId should be submitted", async () => {
    const handleSubmit = jest.fn();

    render(
      <InternalPortalForm
        flows={[{ id: "portal", text: "portal" }]}
        handleSubmit={handleSubmit}
      />
    );

    const dropdown = screen.queryByTestId("flowId");
    userEvent.selectOptions(dropdown, "portal");

    await waitFor(() => {
      fireEvent.submit(screen.getByTestId("form"));
    });

    expect(handleSubmit).toHaveBeenCalledWith("portal");
  });
});

test("do not display select field when there are no flows to select", () => {
  render(<InternalPortalForm />);
  expect(screen.queryByTestId("flowId")).not.toBeInTheDocument();
});

test("updating an internal portal", async () => {
  const handleSubmit = jest.fn();

  render(
    <InternalPortalForm id="test" text="val" handleSubmit={handleSubmit} />
  );

  expect(screen.queryByTestId("flowId")).not.toBeInTheDocument();

  const textInput = screen.getByPlaceholderText("Portal name");

  expect(textInput).toHaveValue("val");

  userEvent.type(textInput, "{selectall}new val");

  await waitFor(() => {
    fireEvent.submit(screen.getByTestId("form"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    type: TYPES.InternalPortal,
    data: {
      flowId: "", // will be removed when saving the data
      text: "new val",
    },
  });
});

describe("validations", () => {
  describe("if no flowId is chosen", () => {
    // TODO: this is quite slow, evaluate speed difference using test.each
    // https://jestjs.io/docs/en/api#testeachtablename-fn-timeout
    const scenarios = [
      { action: "adding without flows", error: "Required." },
      { action: "updating without flows", id: "test", error: "Required." },
      {
        action: "adding with flows",
        flows: [{ id: "portal", text: "portal" }],
        error: "Required if no flow is selected",
      },
      {
        action: "updating with flows",
        flows: [{ id: "portal", text: "portal" }],
        id: "test",
        error: "Required if no flow is selected",
      },
    ];
    for (const scenario of scenarios) {
      test(scenario.action, async () => {
        const handleSubmit = jest.fn();

        render(
          <InternalPortalForm
            id={scenario.id}
            flows={scenario.flows}
            handleSubmit={handleSubmit}
          />
        );

        await waitFor(() => {
          fireEvent.submit(screen.getByTestId("form"));
        });

        expect(screen.getByText(scenario.error)).toBeInTheDocument();
        expect(handleSubmit).not.toHaveBeenCalled();
      });
    }
  });
});
