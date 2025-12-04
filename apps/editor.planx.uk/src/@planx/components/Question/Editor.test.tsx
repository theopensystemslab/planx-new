import { fireEvent, screen, waitFor } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";

import Question from "./Editor";

it("renders without error", () => {
  setup(
    <DndProvider backend={HTML5Backend}>
      <Question node={{}} options={[]} />
    </DndProvider>,
  );
  expect(screen.getByText("Question")).toBeInTheDocument();
  expect(screen.getByText("Add option")).toBeInTheDocument();
});

it("displays the options editor when the 'Add option' button is clicked", async () => {
  const { user } = setup(
    <DndProvider backend={HTML5Backend}>
      <Question node={{}} options={[]} />
    </DndProvider>,
  );
  await user.click(screen.getByRole("button", { name: /Add option/i }));

  const optionsEditor = await screen.findByPlaceholderText("Option");
  expect(optionsEditor).toBeInTheDocument();
});

describe("validation", () => {
  test("labels for options must be unique", async () => {
    const { user } = setup(
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
