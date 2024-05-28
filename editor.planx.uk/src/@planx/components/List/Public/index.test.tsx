import React from "react";
import { axe, setup } from "testUtils";

import ListComponent, { Props } from "../Public";
import { Zoo } from "../schemas/Zoo";

const mockProps: Props = {
  fn: "mock",
  schema: Zoo,
  schemaName: "Zoo",
  title: "Mock Title",
  description: "Mock description",
};

describe("Basic UI", () => {
  it("renders correctly", () => {
    const { getByText } = setup(<ListComponent {...mockProps} />);

    expect(getByText(/Mock Title/)).toBeInTheDocument();
    expect(getByText(/Mock description/)).toBeInTheDocument();
  });

  it("parses provided schema to render expected form", async () => {
    const { getByLabelText, getByText, user, getByRole, queryAllByRole } =
      setup(<ListComponent {...mockProps} />);

    // Text inputs are generated from schema...
    const textInput = getByLabelText(/What's their name?/) as HTMLInputElement;
    expect(textInput).toBeInTheDocument();
    expect(textInput.type).toBe("text");

    // Props are correctly read
    const emailInput = getByLabelText(
      /What's their email address?/,
    ) as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();
    expect(emailInput.type).toBe("email");

    // Number inputs are generated from schema
    const numberInput = getByLabelText(/How old are they?/) as HTMLInputElement;
    expect(numberInput).toBeInTheDocument();
    expect(numberInput.type).toBe("number");

    // Props are correctly read
    const units = getByText(/years old/);
    expect(units).toBeInTheDocument();

    // Question inputs generated from schema
    // Combobox displayed when number of options > 2
    const selectInput = getByRole("combobox");
    expect(selectInput).toBeInTheDocument();

    // Open combobox
    await user.click(selectInput);

    // All options display
    expect(getByRole("option", { name: "Small" })).toBeInTheDocument();
    expect(getByRole("option", { name: "Medium" })).toBeInTheDocument();
    expect(getByRole("option", { name: "Large" })).toBeInTheDocument();

    // No default option selected
    expect(
      queryAllByRole("option", { selected: true }) as HTMLOptionElement[],
    ).toHaveLength(0);

    // Close combobox
    await user.click(selectInput);

    // Radio groups displayed when number of options = 2
    const radioInput = getByLabelText(/How cute are they?/);
    expect(radioInput).toBeInTheDocument();

    // All options display
    const radioButton1 = getByLabelText("Very") as HTMLInputElement;
    expect(radioButton1).toBeInTheDocument();
    expect(radioButton1.type).toBe("radio");

    const radioButton2 = getByLabelText("Super") as HTMLInputElement;
    expect(radioButton2).toBeInTheDocument();
    expect(radioButton2.type).toBe("radio");

    // No default option selected
    expect(radioButton1).not.toBeChecked();
    expect(radioButton2).not.toBeChecked();

    expect(getByText(/Save/, { selector: "button" })).toBeInTheDocument();
    expect(getByText(/Cancel/, { selector: "button" })).toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = setup(<ListComponent {...mockProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Navigating back", () => {
  test.todo("it pre-populates list correctly");
});

describe("Building a list", () => {
  test.todo("Adding an item");
  test.todo("Editing an item");
  test.todo("Removing an item");
});

describe("Form validation and error handling", () => {
  test.todo("Text field");
  test.todo("Number field");
  test.todo("Question field - select");
  test.todo("Question field - radio");
});

describe("Payload generation", () => {
  it.todo("generates a valid payload on submission");
});
