import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TYPES } from "../../data/types";
import InternalPortalForm from "./InternalPortal";

test("adding a new internal portal", async () => {
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

test("no select field when there are no flows", () => {
  render(<InternalPortalForm />);
  expect(screen.queryByTestId("flowId")).toBeNull();
});

test("updating an internal portal", async () => {
  const handleSubmit = jest.fn();

  render(
    <InternalPortalForm id="test" text="val" handleSubmit={handleSubmit} />
  );

  const textInput = screen.getByPlaceholderText("Portal name");

  expect(textInput).toHaveValue("val");

  userEvent.type(textInput, "{selectall}new val");

  await waitFor(() => {
    fireEvent.submit(screen.getByTestId("form"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    type: TYPES.InternalPortal,
    data: {
      flowId: "", // will be removed when saving
      text: "new val",
    },
  });
});

test.skip("adding an existing internal portal", async () => {
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

  expect(handleSubmit).toHaveBeenCalledWith(["portal"]);
});
