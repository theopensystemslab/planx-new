import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";
import { axe, setup } from "testUtils";

import { TYPES } from "../types";
import InternalPortalForm from "./Editor";

describe("adding an internal portal", () => {
  test("creating a new internal portal", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <InternalPortalForm
        flows={[{ id: "ignore", text: "ignore" }]}
        handleSubmit={handleSubmit}
      />
    );

    const flowSelect = screen.getByTestId("flowId");

    expect(flowSelect).toHaveValue("");
    expect(flowSelect).toBeEnabled();

    await user.type(
      screen.getByPlaceholderText("Portal name"),
      "new internal portal"
    );

    expect(flowSelect).toBeDisabled();

    await fireEvent.submit(screen.getByTestId("form"));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        type: TYPES.InternalPortal,
        data: {
          flowId: "", // will be removed when saving the data
          text: "new internal portal",
        },
      });
    });
  });

  test("selecting an existing internal portal", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <InternalPortalForm
        flows={[{ id: "portal", text: "portal" }]}
        handleSubmit={handleSubmit}
      />
    );

    const dropdown = screen.queryByTestId("flowId");

    expect(dropdown).toHaveValue("");

    if (dropdown) {
      await user.selectOptions(dropdown, "portal");
    }

    await fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith("portal");
    });
  });

  test("if text and flowId are set, only flowId should be submitted", async () => {
    const handleSubmit = jest.fn();

    const { user } = setup(
      <InternalPortalForm
        flows={[{ id: "portal", text: "portal" }]}
        handleSubmit={handleSubmit}
      />
    );

    const dropdown = screen.queryByTestId("flowId");
    if (dropdown) {
      await user.selectOptions(dropdown, "portal");
    }

    await fireEvent.submit(screen.getByTestId("form"));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith("portal");
    });
  });
});

test("do not display select field when there are no flows to select", () => {
  setup(<InternalPortalForm />);
  expect(screen.queryByTestId("flowId")).not.toBeInTheDocument();
});

test("updating an internal portal", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <InternalPortalForm id="test" text="val" handleSubmit={handleSubmit} />
  );

  expect(screen.queryByTestId("flowId")).not.toBeInTheDocument();

  const textInput = screen.getByPlaceholderText("Portal name");

  expect(textInput).toHaveValue("val");

  await user.clear(textInput);
  await user.type(textInput, "new val");
  await fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.InternalPortal,
      data: {
        flowId: "", // will be removed when saving the data
        text: "new val",
      },
    });
  });
});

describe("validations", () => {
  describe("if no flowId is chosen", () => {
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
      test(`${scenario.action}`, async () => {
        const handleSubmit = jest.fn();

        setup(
          <InternalPortalForm
            id={scenario.id}
            flows={scenario.flows}
            handleSubmit={handleSubmit}
          />
        );

        await fireEvent.submit(screen.getByTestId("form"));

        expect(await screen.findByText(scenario.error)).toBeInTheDocument();
        expect(handleSubmit).not.toHaveBeenCalled();
      });
    }
  });
});

it("should not have any accessibility violations", async () => {
  const handleSubmit = jest.fn();

  const { container } = setup(
    <InternalPortalForm
      flows={[{ id: "portal", text: "portal" }]}
      handleSubmit={handleSubmit}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
