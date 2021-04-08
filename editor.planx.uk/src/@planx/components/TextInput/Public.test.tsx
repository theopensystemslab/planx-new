import { act, render, screen } from "@testing-library/react";
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

  await act(async () => {
    await userEvent.type(
      await screen.getByPlaceholderText("what?"),
      "something"
    );
    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith(["something"]);
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

  await act(async () => {
    await userEvent.type(screen.getByPlaceholderText("what?"), "not-an-email");
    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});
