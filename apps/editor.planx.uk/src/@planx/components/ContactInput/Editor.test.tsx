import { fireEvent, screen, within } from "@testing-library/react";
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { setup } from "testUtils";

import ContactInputComponent from "./Editor";

describe("ContactInputComponent - Editor Modal", () => {
  it("renders", async () => {
    await setup(
      <DndProvider backend={HTML5Backend}>
        <ContactInputComponent id="test" />
      </DndProvider>,
    );
    expect(screen.getByText("Contact input")).toBeInTheDocument();
  });

  it("requires a title", async () => {
    const handleSubmit = vi.fn();
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ContactInputComponent id="test" handleSubmit={handleSubmit} />
      </DndProvider>,
    );

    fireEvent.submit(screen.getByRole("form"));

    expect(
      await screen.findByText("Error: title is a required field"),
    ).toBeVisible();
  });

  it("requires a data field", async () => {
    const handleSubmit = vi.fn();
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ContactInputComponent id="test" handleSubmit={handleSubmit} />
      </DndProvider>,
    );

    const title = screen.getByPlaceholderText("Title");
    await user.type(title, "What is your contact info?");

    fireEvent.submit(screen.getByRole("form"));

    expect(
      screen.queryByText("Error: title is a required field"),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByText("Error: fn is a required field"),
    ).toBeVisible();
  });

  it("can be submitted successfully", async () => {
    const handleSubmit = vi.fn();
    const { user } = await setup(
      <DndProvider backend={HTML5Backend}>
        <ContactInputComponent id="test" handleSubmit={handleSubmit} />
      </DndProvider>,
    );

    const title = screen.getByPlaceholderText("Title");
    await user.type(title, "What is your contact info?");

    const autocompleteComponent = screen.getByTestId(
      "contact-input-data-field",
    );
    const autocompleteInput = within(autocompleteComponent).getByRole(
      "combobox",
    );

    await user.click(autocompleteInput);
    await user.type(autocompleteInput, "my.data.value");
    await user.keyboard("{Enter}");

    fireEvent.submit(screen.getByRole("form"));

    expect(
      screen.queryByText("Error: title is a required field"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Error: fn is a required field"),
    ).not.toBeInTheDocument();

    // expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});
