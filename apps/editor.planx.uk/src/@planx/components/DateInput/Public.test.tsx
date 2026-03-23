import { screen, waitFor } from "@testing-library/react";
import { uniqueId } from "lodash";
import React from "react";
import { setup } from "testUtils";
import { vi } from "vitest";
import { axe } from "vitest-axe";

import { ERROR_MESSAGE } from "../shared/constants";
import { fillInFieldsUsingLabel } from "../shared/testHelpers";
import DateInput from "./Public";

test("submits a date", async () => {
  const handleSubmit = vi.fn();
  const componentId = uniqueId();

  const { user } = await setup(
    <DateInput
      id={componentId}
      title="Pizza Day"
      handleSubmit={handleSubmit}
    />,
  );

  expect(screen.getByRole("heading")).toHaveTextContent("Pizza Day");

  await fillInFieldsUsingLabel(user, {
    Day: "22",
    Month: "05",
    Year: "2010",
  });

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [componentId]: "2010-05-22",
    },
  });
});

test("recovers previously submitted date when clicking the back button", async () => {
  const handleSubmit = vi.fn();
  const componentId = uniqueId();

  const { user } = await setup(
    <DateInput
      id={componentId}
      title="Pizza Day"
      handleSubmit={handleSubmit}
      previouslySubmittedData={{
        data: {
          [componentId]: "2010-05-22",
        },
      }}
    />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [componentId]: "2010-05-22",
    },
  });
});

test("recovers previously submitted date when clicking the back button even if a data field is set", async () => {
  const handleSubmit = vi.fn();
  const componentId = uniqueId();
  const dataField = "data-field";

  const { user } = await setup(
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
    />,
  );

  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [dataField]: "2010-05-22",
    },
  });
});

test("renders", async () => {
  await setup(<DateInput title="Enter a date" />);

  expect(screen.getByRole("heading")).toHaveTextContent("Enter a date");
});

test("allows user to type into input field and click continue", async () => {
  const handleSubmit = vi.fn();

  const { user } = await setup(
    <DateInput title="Enter a date" handleSubmit={handleSubmit} />,
  );

  const day = screen.getByLabelText("Day");

  await user.type(day, "2");
  // Trigger blur event
  await user.tab();

  expect(day).toHaveValue("02");

  const month = screen.getByLabelText("Month");
  await user.type(month, "1");
  await user.type(month, "1");
  expect(month).toHaveValue("11");

  const year = screen.getByLabelText("Year");
  await user.type(year, "1");
  await user.type(year, "9");
  await user.type(year, "9");
  await user.type(year, "2");
  await user.click(screen.getByTestId("continue-button"));

  expect(handleSubmit).toHaveBeenCalled();
});

test("date fields have a max length set", async () => {
  await setup(<DateInput title="Enter a date" />);

  const day = screen.getByLabelText("Day") as HTMLInputElement;
  const month = screen.getByLabelText("Month") as HTMLInputElement;
  const year = screen.getByLabelText("Year") as HTMLInputElement;

  expect(day.maxLength).toBe(2);
  expect(month.maxLength).toBe(9);
  expect(year.maxLength).toBe(4);
});

it("should not have any accessibility violations upon initial load", async () => {
  const { container } = await setup(
    <DateInput id="123" title="Test title" description="description" />,
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

it("should not have any accessibility violations whilst in the error state", async () => {
  const { container, user } = await setup(
    <DateInput id="testId" title="Test title" description="description" />,
  );

  // Find all error elements
  const errorElements = screen.getAllByTestId(new RegExp(`^${ERROR_MESSAGE}`));

  // Check that they're all empty before submitting
  errorElements.forEach((element) => {
    expect(element).toBeEmptyDOMElement();
  });

  // Trigger error state
  await user.click(screen.getByTestId("continue-button"));

  // At least one error message should now appear
  await waitFor(() => {
    const nonEmptyErrors = screen
      .getAllByTestId(new RegExp(`^${ERROR_MESSAGE}`))
      .filter((el) => el.textContent && el.textContent.trim() !== "");
    expect(nonEmptyErrors.length).toBeGreaterThan(0);
  });

  // Verify role attribute is set correctly
  const visibleErrors = screen
    .getAllByTestId(new RegExp(`^${ERROR_MESSAGE}`))
    .filter((el) => el.textContent && el.textContent.trim() !== "");
  visibleErrors.forEach((el) => {
    expect(el).toHaveAttribute("role", "alert");
  });

  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
