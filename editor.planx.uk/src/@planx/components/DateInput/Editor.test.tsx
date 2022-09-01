import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import DateInputComponent from "./Editor";

const minError = "Min must be less than max";
const maxError = "Max must be greater than min";
const invalidError = "Enter a valid date in DD.MM.YYYY format";

describe("DateInputComponent - Editor Modal", () => {
  it("renders", () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <DateInputComponent id="test" />
      </DndProvider>
    );
    expect(screen.getByText("Date Input")).toBeInTheDocument();
  });

  it("throws an error for incompatible date values", async () => {
    const handleSubmit = jest.fn();
    render(
      <DndProvider backend={HTML5Backend}>
        <DateInputComponent id="test" handleSubmit={handleSubmit} />
      </DndProvider>
    );

    const [minDay, maxDay] = screen.getAllByPlaceholderText("DD");
    const [minMonth, maxMonth] = screen.getAllByPlaceholderText("MM");
    const [minYear, maxYear] = screen.getAllByPlaceholderText("YYYY");

    expect(screen.queryByText(minError)).toBeNull();
    expect(screen.queryByText(maxError)).toBeNull();

    await userEvent.type(minDay, "01");
    await userEvent.type(minMonth, "01");
    await userEvent.type(minYear, "2000");

    await userEvent.type(maxDay, "01");
    await userEvent.type(maxMonth, "01");
    await userEvent.type(maxYear, "1900");

    fireEvent.submit(screen.getByRole("form"));

    expect(await screen.findByText(minError)).toBeVisible();
    expect(await screen.findByText(maxError)).toBeVisible();
  });

  it("does not show errors if min is less than max", async () => {
    const handleSubmit = jest.fn();
    render(
      <DndProvider backend={HTML5Backend}>
        <DateInputComponent id="test" handleSubmit={handleSubmit} />
      </DndProvider>
    );

    const [minDay, maxDay] = screen.getAllByPlaceholderText("DD");
    const [minMonth, maxMonth] = screen.getAllByPlaceholderText("MM");
    const [minYear, maxYear] = screen.getAllByPlaceholderText("YYYY");

    expect(screen.queryByText(minError)).toBeNull();
    expect(screen.queryByText(maxError)).toBeNull();

    await userEvent.type(minDay, "01");
    await userEvent.type(minMonth, "01");
    await userEvent.type(minYear, "1900");

    await userEvent.type(maxDay, "01");
    await userEvent.type(maxMonth, "01");
    await userEvent.type(maxYear, "2000");

    fireEvent.submit(screen.getByRole("form"));

    expect(screen.queryByText(minError)).toBeNull();
    expect(screen.queryByText(maxError)).toBeNull();
  });

  it("does not show an error if user deletes a date", async () => {
    const handleSubmit = jest.fn();
    const node = { data: { min: "1900-02-13", max: "2000-12-14" } };
    render(
      <DndProvider backend={HTML5Backend}>
        <DateInputComponent id="test" handleSubmit={handleSubmit} node={node} />
      </DndProvider>
    );

    const [minDay, maxDay] = screen.getAllByPlaceholderText("DD");
    const [minMonth, maxMonth] = screen.getAllByPlaceholderText("MM");
    const [minYear, maxYear] = screen.getAllByPlaceholderText("YYYY");

    expect(screen.queryAllByText(invalidError)).toHaveLength(0);

    for await (const el of [
      minDay,
      maxDay,
      minMonth,
      maxMonth,
      minYear,
      maxYear,
    ]) {
      await await userEvent.clear(el);
    }

    fireEvent.submit(screen.getByRole("form"));

    await waitFor(() => {
      expect(screen.queryAllByText(invalidError)).toHaveLength(0);
    });
  });
});
