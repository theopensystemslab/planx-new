import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import NestedFlowForm from "./Editor";

test("adding a nested flow", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <NestedFlowForm
      flows={[
        { id: "a", name: "flow a", slug: "flow-a", team: "team" },
        { id: "b", name: "flow b", slug: "flow-b", team: "team" },
      ]}
      handleSubmit={handleSubmit}
    />,
  );
  const autocompleteComponent = screen.getByTestId("flowId");
  const autocompleteInput = within(autocompleteComponent).getByRole("combobox");

  await user.click(autocompleteInput);

  await user.click(screen.getByTestId("flow-b"));

  expect(autocompleteInput).toHaveValue("team - flow b");

  const extPortalForm = screen.getByTestId("form");

  fireEvent.submit(extPortalForm);

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.NestedFlow,
      data: {
        flow: { id: "b", name: "flow b", slug: "flow-b", team: "team" },
        flowId: "b",
        tags: [],
        notes: "",
        isTemplatedNode: false,
        templatedNodeInstructions: "",
        areTemplatedNodeInstructionsRequired: false,
      },
    }),
  );
});

test("changing a nested flow", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <NestedFlowForm
      flowId="b"
      flows={[
        { id: "a", name: "flow a", slug: "flow-a", team: "team" },
        { id: "b", name: "flow b", slug: "flow-b", team: "team" },
      ]}
      handleSubmit={handleSubmit}
    />,
  );

  const autocompleteComponent = screen.getByTestId("flowId");
  const autocompleteInput = within(autocompleteComponent).getByRole("combobox");

  expect(autocompleteInput).toHaveValue("team - flow b");

  await user.click(autocompleteInput);

  await user.click(screen.getByTestId("flow-a"));

  expect(autocompleteInput).toHaveValue("team - flow a");

  const extPortalForm = screen.getByTestId("form");

  fireEvent.submit(extPortalForm);

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.NestedFlow,
      data: {
        flow: { id: "a", name: "flow a", slug: "flow-a", team: "team" },
        flowId: "a",
        tags: [],
        notes: "",
        isTemplatedNode: false,
        templatedNodeInstructions: "",
        areTemplatedNodeInstructionsRequired: false,
      },
    }),
  );
});

test.todo("throws an error when adding if same nested flow already on parent");
