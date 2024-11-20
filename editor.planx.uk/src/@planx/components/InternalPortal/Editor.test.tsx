import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import InternalPortalForm from "./Editor";

describe("adding an internal portal", () => {
  test("creating a new internal portal", async () => {
    const handleSubmit = vi.fn();

    const { user, getByTestId } = setup(
      <InternalPortalForm
        flows={[{ id: "ignore", text: "ignore" }]}
        handleSubmit={handleSubmit}
      />,
    );

    const existingFlowInput = getByTestId("flowId");
    const flowSelect = within(existingFlowInput).getByRole("combobox");

    expect(flowSelect).toBeEnabled();

    await user.type(
      screen.getByPlaceholderText("Enter a portal name"),
      "new internal portal",
    );

    expect(flowSelect).toHaveAttribute("aria-disabled", "true");

    fireEvent.submit(screen.getByTestId("form"));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith({
        type: TYPES.InternalPortal,
        data: {
          flowId: "", // will be removed when saving the data
          text: "new internal portal",
          tags: [],
        },
      });
    });
  });

  test("selecting an existing internal portal", async () => {
    const handleSubmit = vi.fn();

    const { user } = setup(
      <InternalPortalForm
        flows={[{ id: "portal", text: "portal" }]}
        handleSubmit={handleSubmit}
      />,
    );

    const dropdown = await screen.findByRole("combobox", {
      name: "Use an existing portal",
    });
    expect(dropdown).toBeInTheDocument();

    await user.click(dropdown);

    const option = await screen.findByRole("option", { name: "portal" });
    expect(option).toBeInTheDocument();

    await user.click(option);

    fireEvent.submit(screen.getByTestId("form"));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith("portal");
    });
  });

  test("if text and flowId are set, only flowId should be submitted", async () => {
    const handleSubmit = vi.fn();

    const { user } = setup(
      <InternalPortalForm
        flows={[{ id: "portal", text: "portal text" }]}
        handleSubmit={handleSubmit}
      />,
    );

    const dropdown = await screen.findByRole("combobox", {
      name: "Use an existing portal",
    });
    expect(dropdown).toBeInTheDocument();

    await user.click(dropdown);

    const option = await screen.findByRole("option", { name: "portal text" });
    expect(option).toBeInTheDocument();

    await user.click(option);
    fireEvent.submit(screen.getByTestId("form"));

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
  const handleSubmit = vi.fn();

  const { user } = setup(
    <InternalPortalForm id="test" text="val" handleSubmit={handleSubmit} />,
  );

  expect(screen.queryByTestId("flowId")).not.toBeInTheDocument();

  const textInput = screen.getByPlaceholderText("Enter a portal name");

  expect(textInput).toHaveValue("val");

  await user.clear(textInput);
  await user.type(textInput, "new val");
  fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() => {
    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.InternalPortal,
      data: {
        flowId: "", // will be removed when saving the data
        text: "new val",
        tags: [],
      },
    });
  });
});

describe("validations", () => {
  describe("if no flowId is chosen", () => {
    const scenarios = [
      { action: "adding without flows", error: "Enter a portal name" },
      {
        action: "updating without flows",
        id: "test",
        error: "Enter a portal name",
      },
      {
        action: "adding with flows",
        flows: [{ id: "portal", text: "portal" }],
        error: "Enter a portal name or select an existing portal",
      },
      {
        action: "updating with flows",
        flows: [{ id: "portal", text: "portal" }],
        id: "test",
        error: "Enter a portal name or select an existing portal",
      },
    ];
    for (const scenario of scenarios) {
      test(`${scenario.action}`, async () => {
        const handleSubmit = vi.fn();

        setup(
          <InternalPortalForm
            id={scenario.id}
            flows={scenario.flows}
            handleSubmit={handleSubmit}
          />,
        );

        await fireEvent.submit(screen.getByTestId("form"));

        expect(await screen.findByText(scenario.error)).toBeInTheDocument();
        expect(handleSubmit).not.toHaveBeenCalled();
      });
    }
  });
});

it("should not have any accessibility violations", async () => {
  const handleSubmit = vi.fn();

  const { container } = setup(
    <InternalPortalForm
      flows={[{ id: "portal", text: "portal" }]}
      handleSubmit={handleSubmit}
    />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
