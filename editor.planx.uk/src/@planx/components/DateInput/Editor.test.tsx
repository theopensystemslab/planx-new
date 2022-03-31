import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { act, Simulate } from "react-dom/test-utils";

import DateInputComponent from "./Editor";

const minError = "Min must be less than max";
const maxError = "Max must be greater than min";

describe("DateInputComponent - Editor Modal", () => {
  it("renders", () => {
    render(
      <DndProvider backend={HTML5Backend}>
        <DateInputComponent id="test" />
      </DndProvider>
    );
    expect(screen.getByText("Date Input")).toBeInTheDocument();
  });

  it("throws an error for incompatible date values", () => {
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

    userEvent.type(minDay, "01");
    userEvent.type(minMonth, "01");
    userEvent.type(minYear, "2000");

    userEvent.type(maxDay, "01");
    userEvent.type(maxMonth, "01");
    userEvent.type(maxYear, "1900");

    act(() => Simulate.submit(screen.getByRole("form")));

    waitFor(() => {
      expect(screen.getByText(minError)).toBeVisible();
      expect(screen.getByText(maxError)).toBeVisible();
    });
  });

  it("does not show errors if min is less than max", () => {
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

    userEvent.type(minDay, "01");
    userEvent.type(minMonth, "01");
    userEvent.type(minYear, "1900");

    userEvent.type(maxDay, "01");
    userEvent.type(maxMonth, "01");
    userEvent.type(maxYear, "2000");

    act(() => Simulate.submit(screen.getByRole("form")));

    waitFor(() => {
      expect(screen.queryByText(minError)).toBeNull();
      expect(screen.queryByText(maxError)).toBeNull();
    });
  });
});
