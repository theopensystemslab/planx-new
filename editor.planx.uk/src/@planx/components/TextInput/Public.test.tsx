import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { TextInputType } from "./model";
import TextInput from "./Public";

test("requires a value before being able to continue", async () => {
  const handleSubmit = jest.fn();

  render(
    <TextInput title="hello" placeholder="what?" handleSubmit={handleSubmit} />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("hello");

  userEvent.type(screen.getByPlaceholderText("what?"), "something");

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalled();
});

test("requires a valid email before being able to continue", async () => {
  const handleSubmit = jest.fn();

  render(
    <TextInput
      title="hello"
      placeholder="what?"
      type={TextInputType.Email}
      handleSubmit={handleSubmit}
    />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("hello");

  userEvent.type(screen.getByPlaceholderText("what?"), "not-an-email");

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalledTimes(1);
});
