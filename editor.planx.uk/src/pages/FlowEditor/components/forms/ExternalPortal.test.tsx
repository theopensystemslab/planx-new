import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import { TYPES } from "../../../../planx-nodes/types";
import ExternalPortalForm from "./ExternalPortal";

test("adding an external portal", async () => {
  const handleSubmit = jest.fn();

  render(
    <ExternalPortalForm
      flows={[
        { id: "a", text: "flow a" },
        { id: "b", text: "flow b" },
      ]}
      handleSubmit={handleSubmit}
    />
  );

  expect(screen.getByTestId("flowId")).toHaveValue("");

  await waitFor(() => {
    fireEvent.change(screen.getByTestId("flowId"), {
      target: { value: "b" },
    });
  });

  await waitFor(() => {
    fireEvent.submit(screen.getByTestId("form"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    type: TYPES.ExternalPortal,
    data: {
      flowId: "b",
    },
  });
});

test("changing an external portal", async () => {
  const handleSubmit = jest.fn();

  render(
    <ExternalPortalForm
      id="test"
      flowId="b"
      flows={[
        { id: "a", text: "flow a" },
        { id: "b", text: "flow b" },
      ]}
      handleSubmit={handleSubmit}
    />
  );

  expect(screen.getByTestId("flowId")).toHaveValue("b");

  await waitFor(() => {
    fireEvent.change(screen.getByTestId("flowId"), {
      target: { value: "a" },
    });
  });

  await waitFor(() => {
    fireEvent.submit(screen.getByTestId("form"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    type: TYPES.ExternalPortal,
    data: {
      flowId: "a",
    },
  });
});

test.todo(
  "don't add external portal if same external portal already in parent"
);
