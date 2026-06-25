import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "test/utils";

import Question from "./Editor";

it("renders without error", async () => {
  await setup(
    <DndProvider backend={HTML5Backend}>
      <Question node={{}} options={[]} />
    </DndProvider>,
  );
  expect(screen.getByText("Add option")).toBeInTheDocument();
});

it("displays the options editor when the 'Add option' button is clicked", async () => {
  const { user } = await setup(
    <DndProvider backend={HTML5Backend}>
      <Question node={{}} options={[]} />
    </DndProvider>,
  );
  await user.click(screen.getByRole("button", { name: /Add option/i }));

  const optionsEditor = await screen.findByPlaceholderText("Option");
  expect(optionsEditor).toBeInTheDocument();
});

describe("data field", () => {
  it("clears option val fields when the question data field is cleared", async () => {
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <Question
          node={{ data: { fn: "my.data.field", text: "A question" } }}
          options={[
            { id: "opt1", data: { text: "Yes", val: "yes" } },
            { id: "opt2", data: { text: "No", val: "no" } },
          ]}
        />
      </DndProvider>,
    );

    const questionDataField = screen.getByTestId("question-data-field");

    await user.click(within(questionDataField).getByTitle("Clear"));

    // Set a new data field value so option val fields become visible again
    await user.click(within(questionDataField).getByRole("combobox"));
    await user.paste("new.data.field");
    await user.keyboard("{Enter}");

    expect(
      within(screen.getByTestId("data-field-autocomplete-option-0")).getByRole(
        "combobox",
      ),
    ).toHaveValue("");
    expect(
      within(screen.getByTestId("data-field-autocomplete-option-1")).getByRole(
        "combobox",
      ),
    ).toHaveValue("");
  });
});

describe("validation", () => {
  test("labels for options must be unique", async () => {
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <Question node={{}} options={[]} />
      </DndProvider>,
    );
    await user.click(screen.getByRole("button", { name: /Add option/i }));
    await user.type(
      screen.getAllByPlaceholderText("Option")[0],
      "Non unique label",
    );

    await user.click(screen.getByRole("button", { name: /Add option/i }));
    await user.type(
      screen.getAllByPlaceholderText("Option")[1],
      "Non unique label",
    );

    expect(
      screen.queryByText("Error: Options must have unique labels"),
    ).not.toBeInTheDocument();

    fireEvent.submit(screen.getByTestId("question-component-form"));

    await waitFor(() =>
      expect(screen.getByText(/Options must have unique labels/)).toBeVisible(),
    );
  }, 10_000);
});
