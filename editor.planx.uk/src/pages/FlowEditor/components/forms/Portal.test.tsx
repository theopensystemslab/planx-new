import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TYPES } from "../../data/types";
import PortalForm from "./Portal";

describe("Adding", () => {
  test("new internal portal", async () => {
    const handleSubmit = jest.fn();

    render(<PortalForm handleSubmit={handleSubmit} />);

    await waitFor(() => {
      fireEvent.change(
        screen.getByPlaceholderText("Portal name"),
        "new internal portal"
      );
    });

    await waitFor(() => {
      // https://github.com/testing-library/react-testing-library/issues/683
      fireEvent.submit(screen.getByTestId("form"));
    });

    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.Portal,
      data: {
        text: "new internal portal",
      },
    });
  });

  test.todo("existing internal portal");

  test("external portal", async () => {
    const handleSubmit = jest.fn();

    render(
      <PortalForm
        externalFlows={[
          { id: "a", text: "flow a" },
          { id: "b", text: "flow b" },
        ]}
        handleSubmit={handleSubmit}
      />
    );

    await waitFor(() => {
      fireEvent.change(screen.getByTestId("flowId"), {
        target: { value: "b" },
      });
    });

    await waitFor(() => {
      fireEvent.submit(screen.getByTestId("form"));
    });

    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.Portal,
      data: {
        flowId: "b",
        // ok that this is a blank value right now as it will get
        // stripped out before saving
        text: "",
      },
    });
  });
});
