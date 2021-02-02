import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import NumberInput from "./Public";

test.skip("renders correctly", () => {
  const handleSubmit = jest.fn();

  act(() => {
    render(
      <NumberInput fn="num" title="Numberwang!" handleSubmit={handleSubmit} />
    );
  });

  expect(screen.getByRole("heading")).toHaveTextContent("Numberwang!");

  act(() => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledTimes(0);

  act(() => {
    userEvent.type(screen.getByPlaceholderText("enter value"), "3");
  });

  act(() => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith(3);
});
