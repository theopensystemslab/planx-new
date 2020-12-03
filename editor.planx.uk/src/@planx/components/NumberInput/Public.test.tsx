import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import NumberInput from "./Public";

test("renders correctly", () => {
  const handleSubmit = jest.fn();

  render(
    <NumberInput fn="num" title="Numberwang!" handleSubmit={handleSubmit} />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Numberwang!");

  expect(screen.getByText("Continue").closest("button")).toBeDisabled();

  userEvent.type(screen.getByPlaceholderText("enter value"), "3");

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalledWith(3);
});
