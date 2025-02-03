import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import ExternalPortalForm from "./Editor";

test("adding an external portal", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <ExternalPortalForm
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

  expect(autocompleteInput).toHaveValue("flow b");

  const extPortalForm = screen.getByTestId("form");

  fireEvent.submit(extPortalForm);

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.ExternalPortal,
      data: {
        flow: { id: "b", name: "flow b", slug: "flow-b", team: "team" },
        flowId: "b",
        tags: [],
        notes: "",
      },
    }),
  );
});

test("changing an external portal", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <ExternalPortalForm
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

  expect(autocompleteInput).toHaveValue("flow b");

  await user.click(autocompleteInput);

  await user.click(screen.getByTestId("flow-a"));

  expect(autocompleteInput).toHaveValue("flow a");

  const extPortalForm = screen.getByTestId("form");

  fireEvent.submit(extPortalForm);

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.ExternalPortal,
      data: {
        flow: { id: "a", name: "flow a", slug: "flow-a", team: "team" },
        flowId: "a",
        tags: [],
        notes: "",
      },
    }),
  );
});

test.todo(
  "don't add external portal if same external portal already in parent",
);
