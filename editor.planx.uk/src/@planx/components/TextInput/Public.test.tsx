import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import TextInput from "./Public";

test("requires a value before being able to continue", async () => {
  const handleSubmit = jest.fn();

  render(
    <TextInput title="hello" placeholder="what?" handleSubmit={handleSubmit} />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("hello");

  expect(screen.getByText("Continue").closest("button")).toBeDisabled();

  userEvent.type(screen.getByPlaceholderText("what?"), "something");

  userEvent.click(screen.getByText("Continue"));

  expect(handleSubmit).toHaveBeenCalled();
});

test.todo("validate email");
