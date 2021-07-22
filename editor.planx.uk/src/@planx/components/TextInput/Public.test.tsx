import { act, fireEvent,render, screen } from "@testing-library/react";
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

  await act(async () => {
    await userEvent.type(screen.getByPlaceholderText("what?"), "not-an-email");
    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

test("requires a valid phone number before being able to continue", async () => {
  const handleSubmit = jest.fn();

  render(
    <TextInput
      title="hello"
      placeholder="what?"
      type={TextInputType.Phone}
      handleSubmit={handleSubmit}
    />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("hello");

  await act(async () => {
    await userEvent.type(screen.getByPlaceholderText("what?"), "not-a-phone");
    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

const examplePhoneNumbers = [
  "01632 960000", // uk non-geographic
  "020 7946 0999", // uk london
  "07700 900999", // uk mobile
  "004408081570192", // with country code
  "(01234) 123456", // welsh landlines :)
];

examplePhoneNumbers.forEach((number) => {
  test(`continues for valid phone number example ${number}`, async () => {
    const handleSubmit = jest.fn();

    render(
      <TextInput
        title="phone"
        placeholder={number}
        type={TextInputType.Phone}
        handleSubmit={handleSubmit}
      />
    );

    fireEvent.change(screen.getByPlaceholderText(number), {
      target: { value: number },
    });

    await act(async () => {
      userEvent.click(screen.getByText("Continue"));
    });

    expect(handleSubmit).toHaveBeenCalled();
  });
});
