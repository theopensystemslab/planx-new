import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { uniqueId } from "lodash";
import React from "react";
import { act } from "react-dom/test-utils";

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

    userEvent.click(screen.getByText("Continue"));
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
    userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalledWith({
    data: {
      [componentId]: "2010-05-22",
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
    await userEvent.click(screen.getByText("Continue"));
  });

  expect(handleSubmit).toHaveBeenCalled();
});

test("padding", () => {
  // Adds zero to single digits
  expect(paddedDate("2021-12-2")).toBe("2021-12-02");
  expect(paddedDate("2021-3-22")).toBe("2021-03-22");
  expect(paddedDate("2021-1-2")).toBe("2021-01-02");

  // Removes extraneous zeroes
  expect(paddedDate("2021-010-2")).toBe("2021-10-02");

  // Leaves single 0 alone
  expect(paddedDate("2021-0-2")).toBe("2021-0-02");
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
