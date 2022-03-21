import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-helper";
import { uniqueId } from "lodash";
import React from "react";
import { act } from "react-dom/test-utils";

import { ERROR_MESSAGE } from "../shared/constants";
import { fillInFieldsUsingPlaceholder } from "../shared/testHelpers";
import { dateRangeSchema, dateSchema, paddedDate } from "./model";
import DateInput from "./Public";

test("submits a date", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();

  render(
    <DateInput id={componentId} title="Pizza Day" handleSubmit={handleSubmit} />
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Pizza Day");

  await waitFor(async () => {
    await fillInFieldsUsingPlaceholder({
      DD: "22",
      MM: "05",
      YYYY: "2010",
    });

    userEvent.click(screen.getByTestId("continue-button"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [componentId]: "2010-05-22",
    },
  });
});

test("recovers previously submitted date when clicking the back button", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();

  render(
    <DateInput
      id={componentId}
      title="Pizza Day"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{
        data: {
          [componentId]: "2010-05-22",
        },
      }}
    />
  );

  await waitFor(() => {
    userEvent.click(screen.getByTestId("continue-button"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [componentId]: "2010-05-22",
    },
  });
});

test("recovers previously submitted date when clicking the back button even if a data field is set", async () => {
  const handleSubmit = jest.fn();
  const componentId = uniqueId();
  const dataField = "data-field";

  render(
    <DateInput
      fn={dataField}
      id={componentId}
      title="Pizza Day"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{
        data: {
          [dataField]: "2010-05-22",
        },
      }}
    />
  );

  await waitFor(() => {
    userEvent.click(screen.getByTestId("continue-button"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [dataField]: "2010-05-22",
    },
  });
});

test("renders", async () => {
  render(<DateInput title="Enter a date" />);

  expect(screen.getByRole("heading")).toHaveTextContent("Enter a date");
});

test("allows user to type into input field and click continue", async () => {
  const handleSubmit = jest.fn();

  render(<DateInput title="Enter a date" handleSubmit={handleSubmit} />);

  const day = screen.getByPlaceholderText("DD");

  await act(async () => {
    await userEvent.type(day, "2");
    // Trigger blur event
    await userEvent.tab();
  });

  expect(day).toHaveValue("02");

  const month = screen.getByPlaceholderText("MM");
  await act(async () => {
    await userEvent.type(month, "1");
    await userEvent.type(month, "1");
  });
  expect(month).toHaveValue("11");

  const year = screen.getByPlaceholderText("YYYY");
  await act(async () => {
    await userEvent.type(year, "1");
    await userEvent.type(year, "9");
    await userEvent.type(year, "9");
    await userEvent.type(year, "2");
    await userEvent.click(screen.getByTestId("continue-button"));
  });

  expect(handleSubmit).toHaveBeenCalled();
});

test("date fields have a max length set", async () => {
  render(<DateInput title="Enter a date" />);

  const day = screen.getByPlaceholderText("DD") as HTMLInputElement;
  const month = screen.getByPlaceholderText("MM") as HTMLInputElement;
  const year = screen.getByPlaceholderText("YYYY") as HTMLInputElement;

  expect(day.maxLength === 2);
  expect(month.maxLength === 2);
  expect(year.maxLength === 4);
});

test("padding on input", () => {
  // Adds zero to single digits greater than 3 on input
  expect(paddedDate("2021-12-6", "input")).toBe("2021-12-06");
  expect(paddedDate("2021-4-22", "input")).toBe("2021-04-22");
  expect(paddedDate("2021-8-4", "input")).toBe("2021-08-04");

  // Leaves valid dates alone
  expect(paddedDate("2021-01-06", "input")).toBe("2021-01-06");
  expect(paddedDate("2021-04-22", "input")).toBe("2021-04-22");
  expect(paddedDate("2021-08-04", "input")).toBe("2021-08-04");

  // Leaves single 0 alone
  expect(paddedDate("2021-0-4", "input")).toBe("2021-0-04");
  expect(paddedDate("2021-10-0", "input")).toBe("2021-10-0");
});

test("padding on blur", () => {
  // Adds zero to single digits less than or equal to 3 on blur
  expect(paddedDate("2021-12-1", "blur")).toBe("2021-12-01");
  expect(paddedDate("2021-3-22", "blur")).toBe("2021-03-22");
  expect(paddedDate("2021-2-2", "blur")).toBe("2021-02-02");

  // Leaves valid dates alone
  expect(paddedDate("2021-01-06", "blur")).toBe("2021-01-06");
  expect(paddedDate("2021-04-22", "blur")).toBe("2021-04-22");
  expect(paddedDate("2021-08-04", "blur")).toBe("2021-08-04");

  // Leaves single 0 alone
  expect(paddedDate("2021-0-2", "blur")).toBe("2021-0-02");
  expect(paddedDate("2021-10-0", "blur")).toBe("2021-10-0");
});

test("validation", async () => {
  expect(await dateSchema().isValid("2021-03-23")).toBe(true);
  expect(await dateSchema().isValid("2021-23-03")).toBe(false);
  expect(
    await dateRangeSchema({ min: "1990-01-01", max: "1999-12-31" }).isValid(
      "1995-06-15"
    )
  ).toBe(true);
  expect(
    await dateRangeSchema({ min: "1990-01-01", max: "1999-12-31" }).isValid(
      "2021-06-15"
    )
  ).toBe(false);
  expect(
    await dateRangeSchema({ min: "1990-01-01", max: "1999-12-31" }).isValid(
      "1980-06-15"
    )
  ).toBe(false);
});

it("should not have any accessibility violations upon initial load", async () => {
  const { container } = render(
    <DateInput id="123" title="Test title" description="description" />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it("should not have any accessibility violations whilst in the error state", async () => {
  const { container } = render(
    <DateInput id="testId" title="Test title" description="description" />
  );

  const dateElements = ["day", "month", "year"];

  // There is an ErrorWrapper per input, which should not display on load
  dateElements.forEach((el) => {
    const inputErrorWrapper = container.querySelector(
      `#${ERROR_MESSAGE}-testId-${el}`
    );
    expect(inputErrorWrapper).toBeEmptyDOMElement();
  });

  // There is a main ErrorWrapper, which should not display on load
  const mainErrorMessage = container.querySelector(`#${ERROR_MESSAGE}-testId`);
  expect(mainErrorMessage).toBeEmptyDOMElement();

  await waitFor(() => {
    // Trigger error state
    userEvent.click(screen.getByTestId("continue-button"));
  });

  // Individual input errors do not display, and are not in an error state
  dateElements.forEach((el) => {
    const inputErrorWrapper = container.querySelector(
      `#${ERROR_MESSAGE}-testId-${el}`
    );
    expect(inputErrorWrapper).toBeEmptyDOMElement();
    expect(inputErrorWrapper).not.toHaveAttribute("role", "status");
  });

  // Main ErrorWrapper does display, and is in error state
  expect(mainErrorMessage).not.toBeEmptyDOMElement();
  expect(mainErrorMessage?.parentElement).toHaveAttribute("role", "status");

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
