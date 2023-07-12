import { fireEvent, screen } from "@testing-library/react";
import { uniqueId } from "lodash";
import React from "react";
import { axe, setup } from "testUtils";

import { ERROR_MESSAGE } from "../shared/constants";
import { TextInputType } from "./model";
import TextInput from "./Public";
test("requires a value before being able to continue", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <TextInput title="hello" handleSubmit={handleSubmit} />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent("hello");

  await user.type(screen.getByLabelText("hello"), "something");
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

test("requires a valid email before being able to continue", async () => {
  const handleSubmit = jest.fn();

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
  const handleSubmit = jest.fn();
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
  const handleSubmit = jest.fn();
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
    const handleSubmit = jest.fn();

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

it("should change the role of the ErrorWrapper when an invalid input is given", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <TextInput
      title="Short Text"
      type={TextInputType.Short}
      handleSubmit={handleSubmit}
      id="testId"
    ></TextInput>,
  );

  const [errorWrapper, ..._rest] = screen.getAllByTestId("error-wrapper");
  user.click(screen.getByTestId("continue-button"));

  expect(errorWrapper).not.toBeEmptyDOMElement();
  expect(errorWrapper).toHaveAttribute("role", "status");
});
