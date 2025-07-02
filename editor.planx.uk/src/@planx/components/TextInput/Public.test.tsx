import { fireEvent, screen } from "@testing-library/react";
import { uniqueId } from "lodash";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { ERROR_MESSAGE } from "../shared/constants";
import { TextInputType } from "./model";
import TextInput from "./Public";

const twentyFiveCharacterTest = "25 characters for me.....";

test("requires a value before being able to continue", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <TextInput title="hello" handleSubmit={handleSubmit} />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent("hello");

  await user.type(screen.getByLabelText("hello"), "something");
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

test("requires a non-empty string before being able to continue", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <TextInput
      title="hello"
      type={TextInputType.Short}
      handleSubmit={handleSubmit}
    />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent("hello");

  await user.type(screen.getByLabelText("hello"), " ");
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledTimes(0);

  const errorMessage = await screen.findByText(
    /Enter your answer before continuing/,
  );
  expect(errorMessage).toBeVisible();
});

test("requires a valid email before being able to continue", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <TextInput
      title="hello"
      type={TextInputType.Email}
      handleSubmit={handleSubmit}
    />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent("hello");

  await user.type(screen.getByLabelText("hello"), "not-an-email");
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

test("recovers previously submitted text when clicking the back button", async () => {
  const handleSubmit = vi.fn();
  const nodeId = uniqueId();

  const { user } = setup(
    <TextInput
      id={nodeId}
      title="Submit text"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{
        data: {
          [nodeId]: "Previously submitted text",
        },
      }}
    />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [nodeId]: "Previously submitted text",
    },
  });
});

test("recovers previously submitted text when clicking the back button even if a data field is set", async () => {
  const handleSubmit = vi.fn();
  const nodeId = uniqueId();

  const { user } = setup(
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
    />,
  );

  await user.click(screen.getByTestId("continue-button"));

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
    const handleSubmit = vi.fn();

    const { user } = setup(
      <TextInput
        title="phone"
        type={TextInputType.Phone}
        handleSubmit={handleSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("phone"), {
      target: { value: number },
    });

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalled();
  });
});

it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <TextInput title="phone" type={TextInputType.Phone} />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it("should always an empty error message element in the DOM", () => {
  setup(
    <TextInput
      title="Short Text"
      type={TextInputType.Short}
      id="testId"
    ></TextInput>,
  );
  const errorMessage = screen.getByTestId(`${ERROR_MESSAGE}-testId`);
  expect(errorMessage).toBeEmptyDOMElement();
});

it("should change the role of the ErrorText when an invalid input is given", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <TextInput
      title="Short Text"
      type={TextInputType.Short}
      handleSubmit={handleSubmit}
      id="testId"
    ></TextInput>,
  );

  await user.click(screen.getByTestId("continue-button"));
  const errorMessage = screen.getByTestId(`${ERROR_MESSAGE}-testId`);
  user.click(screen.getByTestId("continue-button"));

  expect(errorMessage).not.toBeEmptyDOMElement();
  expect(errorMessage).toHaveAttribute("role", "alert");
});

test("character limit counter should appear for long text inputs", async () => {
  setup(<TextInput title="hello" type={TextInputType.Long} />);

  const characterCounter = await screen.findByTestId("screen-reader-count");
  expect(characterCounter).toBeInTheDocument();
});

test("character limit counter should not appear for short text inputs", async () => {
  setup(<TextInput title="hello" type={TextInputType.Short} />);
  const characterCounter = screen.queryByTestId("screen-reader-count");

  expect(characterCounter).not.toBeInTheDocument();
});

test("character limit counter should change when typed", async () => {
  const { user } = setup(<TextInput title="hello" type={TextInputType.Long} />);

  const textArea = screen.getByRole("textbox", {
    name: /hello/i,
  });

  await user.type(textArea, twentyFiveCharacterTest);

  const newCharacterCounter = await screen.findByText(
    "You have 225 characters remaining",
  );

  expect(newCharacterCounter).toBeInTheDocument();
});

test("character limit counter shows error state when over limit", async () => {
  const { user } = setup(<TextInput title="hello" type={TextInputType.Long} />);
  const textArea = screen.getByRole("textbox", {
    name: /hello/i,
  });

  await user.type(textArea, `${twentyFiveCharacterTest.repeat(10)}`);
  await user.type(textArea, `extra`);

  const errorCharacterCounter = await screen.findByText(
    "You have 5 characters too many",
  );

  expect(errorCharacterCounter).toHaveStyle({ color: "#D4351C" });
});

test("character limit counter should meet accessibility requirements", async () => {
  const { user, container } = setup(
    <TextInput title="hello" type={TextInputType.Long} />,
  );
  const textArea = screen.getByRole("textbox", {
    name: /hello/i,
  });

  const results = await axe(container);
  expect(results).toHaveNoViolations();

  await user.type(textArea, `${twentyFiveCharacterTest.repeat(10)}`);

  const resultsAfterTyping = await axe(container);
  expect(resultsAfterTyping).toHaveNoViolations();

  await user.type(textArea, `extra`);
  const resultsWithError = await axe(container);
  expect(resultsWithError).toHaveNoViolations();
});
