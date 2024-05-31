import { fireEvent, screen } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { act } from "react-dom/test-utils";
import { setup } from "testUtils";

import DateInputComponent from "./Editor";

// double regular timeout for tests in this file, as they regularly timeout on CI
jest.setTimeout(10000);

const minError = "Min must be less than max";
const maxError = "Max must be greater than min";
const invalidError = "Enter a valid date in DD.MM.YYYY format";

describe("DateInputComponent - Editor Modal", () => {
  it("renders", () => {
    setup(
      <DndProvider backend={HTML5Backend}>
        <DateInputComponent id="test" />
      </DndProvider>,
    );
    expect(screen.getByText("Date Input")).toBeInTheDocument();
  });

  it("throws an error for incompatible date values", async () => {
    const handleSubmit = jest.fn();
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <DateInputComponent id="test" handleSubmit={handleSubmit} />
      </DndProvider>,
    );

    const [minDay, maxDay] = screen.getAllByRole("textbox", { name: "Day" });
    const [minMonth, maxMonth] = screen.getAllByRole("textbox", {
      name: "Month",
    });
    const [minYear, maxYear] = screen.getAllByRole("textbox", { name: "Year" });

    expect(screen.queryByText(minError)).toBeNull();
    expect(screen.queryByText(maxError)).toBeNull();

    await user.type(minDay, "01");
    await user.type(minMonth, "01");
    await user.type(minYear, "2000");

    await user.type(maxDay, "01");
    await user.type(maxMonth, "01");
    await user.type(maxYear, "1900");

    fireEvent.submit(screen.getByRole("form"));

    expect(await screen.findByText(minError)).toBeVisible();
    expect(await screen.findByText(maxError)).toBeVisible();
  });

  it("does not show errors if min is less than max", async () => {
    const promise = Promise.resolve();
    const handleSubmit = jest.fn(() => promise);
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <DateInputComponent id="test" handleSubmit={handleSubmit} />
      </DndProvider>,
    );

    const [minDay, maxDay] = screen.getAllByLabelText("Day");
    const [minMonth, maxMonth] = screen.getAllByLabelText("Month");
    const [minYear, maxYear] = screen.getAllByLabelText("Year");

    expect(screen.queryByText(minError)).toBeNull();
    expect(screen.queryByText(maxError)).toBeNull();

    await user.type(minDay, "01");
    await user.type(minMonth, "01");
    await user.type(minYear, "1900");

    await user.type(maxDay, "01");
    await user.type(maxMonth, "01");
    await user.type(maxYear, "2000");

    fireEvent.submit(screen.getByRole("form"));

    expect(screen.queryByText(minError)).toBeNull();
    expect(screen.queryByText(maxError)).toBeNull();
    await act(async () => await promise);
  });

  it("does not show an error if user deletes a date", async () => {
    const promise = Promise.resolve();
    const handleSubmit = jest.fn(() => promise);
    const node = { data: { min: "1900-02-13", max: "2000-12-14" } };
    const { user } = setup(
      <DndProvider backend={HTML5Backend}>
        <DateInputComponent id="test" handleSubmit={handleSubmit} node={node} />
      </DndProvider>,
    );

    const [minDay, maxDay] = screen.getAllByLabelText("Day");
    const [minMonth, maxMonth] = screen.getAllByLabelText("Month");
    const [minYear, maxYear] = screen.getAllByLabelText("Year");

    expect(screen.queryAllByText(invalidError)).toHaveLength(0);

    for (const el of [minDay, maxDay, minMonth, maxMonth, minYear, maxYear]) {
      await user.clear(el);
    }
    fireEvent.submit(screen.getByRole("form"));

    expect(screen.queryAllByText(invalidError)).toHaveLength(0);
    await act(async () => await promise);
  });
});
