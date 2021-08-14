import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { act } from "react-dom/test-utils";

import { dateRangeSchema, dateSchema } from "./model";
import DateInput from "./Public";

test("renders", async () => {
  render(<DateInput title="Enter a date" />);

  expect(screen.getByRole("heading")).toHaveTextContent("Enter a date");
});

test("input works as expected", async () => {
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
