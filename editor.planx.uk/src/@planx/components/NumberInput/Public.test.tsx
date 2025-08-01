import { screen } from "@testing-library/react";
import { uniqueId } from "lodash";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import NumberInput from "./Public";

test("renders correctly", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <NumberInput
      fn="num"
      title="Numberwang!"
      units="wangs"
      handleSubmit={handleSubmit}
    />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Numberwang!");

  await user.type(screen.getByLabelText("wangs"), "3");
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({ data: { num: 3 } });
});

test("allows 0 to be input as a valid number", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <NumberInput
      fn="num"
      title="Numberwang!"
      units="wangs"
      handleSubmit={handleSubmit}
    />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Numberwang!");

  await user.type(screen.getByLabelText("wangs"), "0");
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({ data: { num: 0 } });
});

test("requires a positive number to be input by default", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <NumberInput
      fn="doors"
      title="How many doors are you adding?"
      handleSubmit={handleSubmit}
      units="units"
    />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent(
    "How many doors are you adding?",
  );

  await user.type(screen.getByLabelText("units"), "-1");
  await user.click(screen.getByTestId("continue-button"));

  expect(screen.getByText(/Enter a positive number/)).toBeInTheDocument();
  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

test("allows negative numbers to be input when toggled on by editor", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <NumberInput
      fn="fahrenheit"
      title="What's the temperature?"
      handleSubmit={handleSubmit}
      allowNegatives={true}
      units="degrees"
    />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent(
    "What's the temperature?",
  );

  await user.type(screen.getByLabelText("degrees"), "-10");
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({ data: { fahrenheit: -10 } });
});

test("a clear error is shown if decimal value added when onlyWholeNumbers is toggled on", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <NumberInput
      fn="fahrenheit"
      title="What's the temperature?"
      handleSubmit={handleSubmit}
      isInteger={true}
      units="degrees"
    />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent(
    "What's the temperature?",
  );

  const textArea = screen.getByLabelText("degrees");

  await user.type(textArea, "10.06");
  await user.click(screen.getByTestId("continue-button"));

  expect(screen.getByText(/Enter a whole number/)).toBeInTheDocument();
  expect(handleSubmit).not.toHaveBeenCalled();
});

test("allows only whole numbers to be submitted when toggled on by editor", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <NumberInput
      fn="fahrenheit"
      title="What's the temperature?"
      handleSubmit={handleSubmit}
      isInteger={true}
      units="degrees"
    />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent(
    "What's the temperature?",
  );

  const textArea = screen.getByLabelText("degrees");

  await user.type(textArea, "10");
  await user.click(screen.getByTestId("continue-button"));
  expect(handleSubmit).toHaveBeenCalledWith({ data: { fahrenheit: 10 } });
});

test("requires a value before being able to continue", async () => {
  const handleSubmit = vi.fn();

  const { user } = setup(
    <NumberInput fn="num" title="Numberwang!" handleSubmit={handleSubmit} />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

test("recovers previously submitted number when clicking the back button", async () => {
  const handleSubmit = vi.fn();
  const componentId = uniqueId();

  const { user } = setup(
    <NumberInput
      title="Cached Number"
      handleSubmit={handleSubmit}
      id={componentId}
      previouslySubmittedData={{
        data: {
          [componentId]: 43,
        },
      }}
    />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({ data: { [componentId]: 43 } });
});

test("recovers previously submitted number when clicking the back button even if a data field is set", async () => {
  const handleSubmit = vi.fn();
  const componentId = uniqueId();
  const dataField = "data-field";

  const { user } = setup(
    <NumberInput
      fn={dataField}
      title="Cached Number"
      handleSubmit={handleSubmit}
      id={componentId}
      previouslySubmittedData={{
        data: {
          [dataField]: 43,
        },
      }}
    />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({ data: { [dataField]: 43 } });
});

it("should not have any accessibility violations", async () => {
  const { container } = setup(
    <NumberInput fn="num" title="Numberwang!" units="wangs" />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
