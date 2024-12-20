import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";

import ExternalPortalForm from "./Editor";

test("adding an external portal", async () => {
  const handleSubmit = vi.fn();

  setup(
    <ExternalPortalForm
      flows={[
        { id: "a", text: "flow a" },
        { id: "b", text: "flow b" },
      ]}
      handleSubmit={handleSubmit}
    />,
  );

  expect(screen.getByTestId("flowId")).toHaveValue("");

  await fireEvent.change(screen.getByTestId("flowId"), {
    target: { value: "b" },
  });
  await fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.ExternalPortal,
      data: {
        flowId: "b",
        tags: [],
        notes: "",
      },
    }),
  );
});

test("changing an external portal", async () => {
  const handleSubmit = vi.fn();

  setup(
    <ExternalPortalForm
      id="test"
      flowId="b"
      flows={[
        { id: "a", text: "flow a" },
        { id: "b", text: "flow b" },
      ]}
      handleSubmit={handleSubmit}
    />,
  );

  expect(screen.getByTestId("flowId")).toHaveValue("b");

  await fireEvent.change(screen.getByTestId("flowId"), {
    target: { value: "a" },
  });
  await fireEvent.submit(screen.getByTestId("form"));

  await waitFor(() =>
    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.ExternalPortal,
      data: {
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
