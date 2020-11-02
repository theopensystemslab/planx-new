import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { TYPES } from "../../data/types";
import InternalPortalForm from "./InternalPortal";

describe("Adding", () => {
  test("new internal portal", async () => {
    const handleSubmit = jest.fn();

    render(<InternalPortalForm handleSubmit={handleSubmit} />);

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
      type: TYPES.InternalPortal,
      data: {
        text: "new internal portal",
      },
    });
  });

  test.todo("existing internal portal");
});
