import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { TYPES } from "../types";
import DateInputComponent from "./Editor";

describe("adding a date", () => {
  test("adding a date with no constraints", async () => {
    const handleSubmit = jest.fn();

    render(
      /*
        TODO: remove the need to wrap isolated components with like this,
              especially when DnD functionality is not being tested.
      */
      <DndProvider backend={HTML5Backend}>
        <DateInputComponent handleSubmit={handleSubmit} />
      </DndProvider>
    );

    userEvent.type(screen.getByPlaceholderText("Title"), "new date");

    await waitFor(() => {
      fireEvent.submit(screen.getByTestId("form"));
    });

    expect(handleSubmit).toHaveBeenCalledWith({
      type: TYPES.DateInput,
      data: {
        title: "new date",
      },
    });
  });

  test.todo("with min and max constraints");

  test.todo("with only min or max constraints");
});

describe("updating a date", () => {
  test.todo(
    "removing min/max constraints also removes them from the node data"
  );
});

describe("validations", () => {
  test.todo("ensure min date is < max date");

  test.todo("ensure min/max date is valid");
});
