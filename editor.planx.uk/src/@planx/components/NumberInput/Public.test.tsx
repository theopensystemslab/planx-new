import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { act } from "react-dom/test-utils";

import NumberInput from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  render(
    <NumberInput fn="num" title="Numberwang!" handleSubmit={handleSubmit} />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Numberwang!");

  await act(async () => {
    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledTimes(0);

  await act(async () => {
    await userEvent.type(screen.getByPlaceholderText("enter value"), "3");
    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith(["3"]);
});
