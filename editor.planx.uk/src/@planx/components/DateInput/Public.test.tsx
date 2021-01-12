import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import DateInput from "./Public";

test("adding a date with no constraints", async () => {
  const handleSubmit = jest.fn();

  render(<DateInput title="Input date" handleSubmit={handleSubmit} />);

  userEvent.type(screen.getByPlaceholderText("DD"), "01");
  userEvent.type(screen.getByPlaceholderText("MM"), "01");
  userEvent.type(screen.getByPlaceholderText("YYYY"), "2020");

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalledWith("2020-01-01");
});

describe.skip("Validations", () => {
  describe("continue button should be disabled when", () => {
    test.only("there is no date value", () => {
      render(<DateInput title="Empty date" />);

      // need .closest() because of the way @material-ui does Buttons
      // see: https://stackoverflow.com/a/56593923
      expect(screen.getByText("Continue").closest("button")).toBeDisabled();
    });

    test("the date is invalid", async () => {
      render(<DateInput title="Invalid date" />);

      // 2021-02-29 === invalid date, only 28 days in Feb 2021

      await waitFor(() => {
        userEvent.type(screen.getByPlaceholderText("DD"), "29");
        userEvent.type(screen.getByPlaceholderText("MM"), "02");
        userEvent.type(screen.getByPlaceholderText("YYYY"), "2021");
      });

      expect(screen.getByText("Continue").closest("button")).toBeDisabled();
    });

    test("the date is out of bounds (< min or > max)", async () => {
      render(
        <DateInput title="Minmax date" min="2020-01-02" max="2020-01-03" />
      );

      const dayInput = screen.getByPlaceholderText("DD");

      // too high
      userEvent.type(dayInput, "04");
      userEvent.type(screen.getByPlaceholderText("MM"), "01");
      userEvent.type(screen.getByPlaceholderText("YYYY"), "2020");

      const continueButton = screen.getByText("Continue").closest("button");

      expect(continueButton).toBeDisabled();

      // too low
      userEvent.clear(dayInput);
      userEvent.type(dayInput, "01");

      expect(continueButton).toBeDisabled();

      // ok
      userEvent.clear(dayInput);
      userEvent.type(dayInput, "03");
      expect(continueButton).toBeEnabled();
    });
  });
});
