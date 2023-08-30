import { screen } from "@testing-library/react";
import { uniqueId } from "lodash";
import React from "react";
import { axe, setup } from "testUtils";

import NumberInput from "./Public";

test("renders correctly", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <NumberInput fn="num" title="Numberwang!" handleSubmit={handleSubmit} />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Numberwang!");

  await user.type(screen.getByLabelText("Numberwang!"), "3");
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({ data: { num: 3 } });
});

test("allows 0 to be input as a valid number", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <NumberInput fn="num" title="Numberwang!" handleSubmit={handleSubmit} />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Numberwang!");

  await user.type(screen.getByLabelText("Numberwang!"), "0");
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({ data: { num: 0 } });
});

test("requires a value before being able to continue", async () => {
  const handleSubmit = jest.fn();

  const { user } = setup(
    <NumberInput fn="num" title="Numberwang!" handleSubmit={handleSubmit} />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledTimes(0);
});

test("recovers previously submitted number when clicking the back button", async () => {
  const handleSubmit = jest.fn();
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
  const handleSubmit = jest.fn();
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
  const { container } = setup(<NumberInput fn="num" title="Numberwang!" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
