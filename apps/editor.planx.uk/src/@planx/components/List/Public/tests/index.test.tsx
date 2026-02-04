import { uploadPrivateFile } from "lib/api/fileUpload/requests";
import React from "react";
import { setup } from "testUtils";
import { it, test, vi } from "vitest";
import { axe } from "vitest-axe";

import { mockZooPayload } from "../../schemas/mocks/Zoo/payload";
import { mockZooProps } from "../../schemas/mocks/Zoo/props";
import ListComponent from "..";
import { fillInResponse } from "./testUtils";

Element.prototype.scrollIntoView = vi.fn();

vi.mock("lib/api/fileUpload/requests");
const mockedUploadPrivateFile = vi.mocked(uploadPrivateFile, true);

beforeEach(() => {
  mockedUploadPrivateFile.mockClear();
});

describe("Basic UI", () => {
  it("renders correctly", async () => {
    const { getByText } = await setup(<ListComponent {...mockZooProps} />);

    expect(getByText(/Mock Title/)).toBeInTheDocument();
    expect(getByText(/Mock description/)).toBeInTheDocument();
  });

  it("parses provided schema to render expected form", async () => {
    const {
      getByLabelText,
      getByText,
      user,
      getByRole,
      queryAllByRole,
      queryByTestId,
    } = await setup(<ListComponent {...mockZooProps} />);

    // Text inputs are generated from schema...
    const textInput = getByLabelText(/What's their name?/) as HTMLInputElement;
    expect(textInput).toBeInTheDocument();
    expect(textInput.type).toBe("text");

    // Input field descriptions are generated from schema if they exist...
    const textInputDescription = getByText(
      /Please make it cute/,
    ) as HTMLElement;
    expect(textInputDescription).toBeInTheDocument();

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

    const saveButton = queryByTestId("save-item-button");
    expect(saveButton).toBeInTheDocument();

    // Hidden on initial item
    const cancelButton = queryByTestId("cancel-edit-item-button");
    expect(cancelButton).not.toBeInTheDocument();
  });

  it("should not have any accessibility violations", async () => {
    const { container } = await setup(<ListComponent {...mockZooProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

test(
  "Input data is displayed in the inactive card view",
  { timeout: 35_000 },
  async () => {
    const { getByText, user } = await setup(
      <ListComponent {...mockZooProps} />,
    );

    await fillInResponse(user);

    // Text input
    expect(getByText("What's their name?", { selector: "td" })).toBeVisible();
    expect(getByText("Richard Parker", { selector: "td" })).toBeVisible();

    // Email input
    expect(
      getByText("What's their email address?", { selector: "td" }),
    ).toBeVisible();
    expect(
      getByText("richard.parker@pi.com", { selector: "td" }),
    ).toBeVisible();

    // Number input
    expect(getByText("How old are they?", { selector: "td" })).toBeVisible();
    expect(getByText("10 years old", { selector: "td" })).toBeVisible();

    // Question input - select
    expect(getByText("What size are they?", { selector: "td" })).toBeVisible();
    expect(getByText("Medium", { selector: "td" })).toBeVisible();

    // Question input - radio
    expect(getByText("How cute are they?", { selector: "td" })).toBeVisible();
    expect(getByText("Very", { selector: "td" })).toBeVisible();

    // Checklist input
    expect(getByText("What do they eat?", { selector: "td" })).toBeVisible();
    expect(getByText("Meat", { selector: "li" })).toBeVisible();
    expect(getByText("Leaves", { selector: "li" })).toBeVisible();
    expect(getByText("Bamboo", { selector: "li" })).toBeVisible();

    // Address input
    expect(
      getByText("What's their address?", { selector: "td" }),
    ).toBeVisible();
    expect(
      getByText(
        "134 Corstorphine Rd, Corstorphine, Edinburgh, Midlothian, EH12 6TS, Scotland",
        { selector: "td" },
      ),
    ).toBeVisible();
  },
);

describe("Navigating back", () => {
  test("it pre-populates list correctly", async () => {
    const { getAllByText, queryByLabelText, getAllByTestId } = await setup(
      <ListComponent
        {...mockZooProps}
        previouslySubmittedData={mockZooPayload}
      />,
    );

    const cards = getAllByTestId(/list-card/);

    // Two cards
    expect(cards).toHaveLength(2);

    // Both inactive
    expect(queryByLabelText(/What's their name?/)).not.toBeInTheDocument();
    expect(getAllByText(/What's their name?/)).toHaveLength(2);

    // With the correct previous data
    expect(getAllByText(/Richard Parker/)).toHaveLength(2);
  });
});
