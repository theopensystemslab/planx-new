import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import { uniqueId } from "lodash";
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

test("recovers previously submitted text when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const nodeId = uniqueId();

  render(
    <TextInput
      id={nodeId}
      title="Submit text"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{
        data: {
          [nodeId]: "Previously submitted text",
        },
      }}
    />
  );

  await act(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [nodeId]: "Previously submitted text",
    },
  });
});

test("recovers previously submitted text when clicking the back button even if a data field is set", async () => {
  const handleSubmit = jest.fn();
  const nodeId = uniqueId();

  render(
    <TextInput
      fn="text-input-key"
      id={nodeId}
      title="Submit text"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{
        data: {
          "text-input-key": "Previously submitted text",
        },
      }}
    />
  );

  await act(async () => {
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      "text-input-key": "Previously submitted text",
    },
  });
});

const examplePhoneNumbers = [
  "01632 960000", // uk non-geographic
  "020 7946 0999", // uk london
  "07700 900999", // uk mobile
  "004408081570192", // with country code
  "(01234) 123456", // welsh landlines :)
  "+1 630 394 8401", // US mobile
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

it("should not have any accessibility violations", async () => {
  const { container } = render(
    <TextInput
      title="phone"
      placeholder="(01234) 123456"
      type={TextInputType.Phone}
    />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
