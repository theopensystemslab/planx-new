import { screen, within } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { cloneDeep, merge } from "lodash";
import React from "react";
import { setup } from "testUtils";
import { it, test, vi } from "vitest";
import { axe } from "vitest-axe";

import ListComponent from "../Public";
import {
  mockUnitsPayload,
  mockUnitsProps,
} from "../schemas/mocks/GenericUnits";
import { mockMaxOneProps } from "../schemas/mocks/MaxOne";
import { mockZooPayload, mockZooProps } from "../schemas/mocks/Zoo";

Element.prototype.scrollIntoView = vi.fn();

describe("Basic UI", () => {
  it("renders correctly", () => {
    const { getByText } = setup(<ListComponent {...mockZooProps} />);

    expect(getByText(/Mock Title/)).toBeInTheDocument();
    expect(getByText(/Mock description/)).toBeInTheDocument();
  });

  it("parses provided schema to render expected form", async () => {
    const { getByLabelText, getByText, user, getByRole, queryAllByRole } =
      setup(<ListComponent {...mockZooProps} />);

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
    const { container } = setup(<ListComponent {...mockZooProps} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe("Building a list", () => {
  it("does not display a default item if the schema has no required minimum", () => {
    const mockWithMinZero = merge(cloneDeep(mockZooProps), {
      schema: { min: 0 },
    });
    const { queryByRole, getByTestId } = setup(
      <ListComponent {...mockWithMinZero} />,
    );

    // No card present
    const activeListHeading = queryByRole("heading", {
      level: 2,
      name: "Animal 1",
    });
    expect(activeListHeading).toBeNull();

    // Button is present allow additional items to be added
    const addItemButton = getByTestId("list-add-button");
    expect(addItemButton).toBeInTheDocument();
    expect(addItemButton).not.toBeDisabled();
  });

  it("displays a default item if the schema has a required minimum", () => {
    const { getByRole, queryByLabelText } = setup(
      <ListComponent {...mockZooProps} />,
    );

    // Card present...
    const activeListHeading = getByRole("heading", {
      level: 2,
      name: "Animal 1",
    });
    expect(activeListHeading).toBeInTheDocument();

    // ...with active fields
    const inputField = queryByLabelText(/What's their name?/);
    expect(inputField).toBeInTheDocument();
    expect(inputField).not.toBeDisabled();
  });

  it("hides the index number in the card header and the 'add another' button if the schema has a max of 1", () => {
    const { getAllByTestId, queryByTestId } = setup(
      <ListComponent {...mockMaxOneProps} />,
    );

    const cards = getAllByTestId(/list-card/);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Parking spaces");

    const addItemButton = queryByTestId("list-add-button");
    expect(addItemButton).not.toBeInTheDocument();
  });

  test("Adding an item", { timeout: 20000 }, async () => {
    const { getAllByTestId, getByTestId, user } = setup(
      <ListComponent {...mockZooProps} />,
    );

    let cards = getAllByTestId(/list-card/);
    expect(cards).toHaveLength(1);

    await fillInResponse(user);

    const addItemButton = getByTestId("list-add-button");
    await user.click(addItemButton);

    // Item successfully added
    cards = getAllByTestId(/list-card/);
    expect(cards).toHaveLength(2);

    // Old item is inactive
    const [firstCard, secondCard] = cards;
    expect(firstCard).not.toBeNull();
    expect(
      within(firstCard!).queryByLabelText(/What's their name?/),
    ).toBeNull();

    // New item is active
    expect(secondCard).not.toBeNull();
    expect(
      within(secondCard!).getByLabelText(/What's their name?/),
    ).toBeInTheDocument();
  });

  test("Editing an item", { timeout: 20000 }, async () => {
    // Setup three cards
    const { getAllByTestId, getByTestId, user } = setup(
      <ListComponent {...mockZooProps} />,
    );

    await fillInResponse(user);

    const addItemButton = getByTestId("list-add-button");

    await user.click(addItemButton);
    await fillInResponse(user);

    await user.click(addItemButton);
    await fillInResponse(user);

    const cards = getAllByTestId(/list-card/);
    expect(cards).toHaveLength(3);

    let [firstCard, secondCard, thirdCard] = cards;

    // No cards currently active
    expect(
      within(firstCard!).queryByLabelText(/What's their name?/),
    ).toBeNull();
    expect(
      within(secondCard!).queryByLabelText(/What's their name?/),
    ).toBeNull();
    expect(
      within(thirdCard!).queryByLabelText(/What's their name?/),
    ).toBeNull();

    // All card in view only / summary mode
    expect(within(firstCard!).getByText(/What's their name?/)).toBeVisible();
    expect(within(secondCard!).getByText(/What's their name?/)).toBeVisible();
    expect(within(thirdCard!).getByText(/What's their name?/)).toBeVisible();

    // Hit "Edit" on second card
    const secondCardEditButton = within(secondCard!).getByRole("button", {
      name: /Edit/,
    });
    await user.click(secondCardEditButton);

    [firstCard, secondCard, thirdCard] = getAllByTestId(/list-card/);

    // Second card now editable
    expect(
      within(secondCard!).getByLabelText(/What's their name?/),
    ).toBeInTheDocument();
  });

  test(
    "Removing an item when all cards are inactive",
    { timeout: 20000 },
    async () => {
      // Setup three cards
      const {
        getByTestId,
        getAllByTestId,
        user,
        getByLabelText,
        queryAllByTestId,
      } = setup(<ListComponent {...mockZooProps} />);

      await fillInResponse(user);

      const addItemButton = getByTestId("list-add-button");

      await user.click(addItemButton);
      await fillInResponse(user);

      await user.click(addItemButton);
      await fillInResponse(user);

      let cards = getAllByTestId(/list-card/);
      expect(cards).toHaveLength(3);

      let [firstCard, secondCard, thirdCard] = cards;

      // Remove third card
      const thirdCardRemoveButton = within(thirdCard!).getByRole("button", {
        name: /Remove/,
      });

      await user.click(thirdCardRemoveButton);
      cards = getAllByTestId(/list-card/);
      expect(cards).toHaveLength(2);

      [firstCard, secondCard, thirdCard] = getAllByTestId(/list-card/);

      // Previous items remain inactive
      expect(
        within(firstCard!).queryByLabelText(/What's their name?/),
      ).toBeNull();
      expect(
        within(secondCard!).queryByLabelText(/What's their name?/),
      ).toBeNull();

      // Remove second card
      const secondCardRemoveButton = within(secondCard!).getByRole("button", {
        name: /Remove/,
      });
      await user.click(secondCardRemoveButton);
      cards = getAllByTestId(/list-card/);
      expect(cards).toHaveLength(1);

      [firstCard] = getAllByTestId(/list-card/);

      // Previous items remain inactive
      expect(
        within(firstCard!).queryByLabelText(/What's their name?/),
      ).toBeNull();

      // Remove first card
      const firstCardRemoveButton = within(firstCard!).getByRole("button", {
        name: /Remove/,
      });
      await user.click(firstCardRemoveButton);
      cards = queryAllByTestId(/list-card/);
      expect(cards).toHaveLength(0);

      // Add item back
      await user.click(addItemButton);

      // This is now editable and active
      const newFirstCardInput = getByLabelText(/What's their name?/);
      expect(newFirstCardInput).toBeInTheDocument();
    },
  );

  test(
    "Removing an item when another card is active",
    { timeout: 20000 },
    async () => {
      // Setup two cards
      const { getAllByTestId, getByTestId, user } = setup(
        <ListComponent {...mockZooProps} />,
      );

      await fillInResponse(user);

      const addItemButton = getByTestId("list-add-button");

      await user.click(addItemButton);

      const [firstCard, secondCard] = getAllByTestId(/list-card/);

      // Second card is active
      expect(
        within(secondCard!).getByLabelText(/What's their name?/),
      ).toBeInTheDocument();

      // Remove first
      const firstCardRemoveButton = within(firstCard!).getByRole("button", {
        name: /Remove/,
      });
      await user.click(firstCardRemoveButton);
      const cards = getAllByTestId(/list-card/);
      expect(cards).toHaveLength(1);

      // First card is active
      expect(
        within(cards[0]!).getByLabelText(/What's their name?/),
      ).toBeInTheDocument();
    },
  );

  test("Cancelling an invalid (new) item removes it", async () => {
    const { getAllByTestId, getByText, user, queryAllByTestId } = setup(
      <ListComponent {...mockZooProps} />,
    );

    let cards = getAllByTestId(/list-card/);
    expect(cards).toHaveLength(1);

    const cancelButton = getByText(/Cancel/, { selector: "button" });
    await user.click(cancelButton);

    cards = queryAllByTestId(/list-card/);
    expect(cards).toHaveLength(0);
  });

  test(
    "Cancelling a valid (existing) item resets previous state",
    { timeout: 20000 },
    async () => {
      const { getByLabelText, getByText, user, queryByText } = setup(
        <ListComponent {...mockZooProps} />,
      );

      await fillInResponse(user);

      expect(getByText("richard.parker@pi.com")).toBeInTheDocument();

      const editButton = getByText(/Edit/, { selector: "button" });
      await user.click(editButton);

      const emailInput = getByLabelText(/email/);
      await user.type(emailInput, "my.new.email@test.com");

      const cancelButton = getByText(/Cancel/, { selector: "button" });
      await user.click(cancelButton);

      expect(queryByText("my.new.email@test.com")).not.toBeInTheDocument();
      expect(getByText("richard.parker@pi.com")).toBeInTheDocument();
    },
  );
});

describe("Form validation and error handling", () => {
  test("form validation is triggered when saving an item", async () => {
    const { user, getByRole, getAllByTestId } = setup(
      <ListComponent {...mockZooProps} />,
    );

    let errorMessages = getAllByTestId(/error-message-input/);
    // One error per field, plus 3 for a date input (one per input)
    const numberOfErrors = mockZooProps.schema.fields.length + 3;

    // Each field has an ErrorWrapper
    expect(errorMessages).toHaveLength(numberOfErrors);

    // All are empty initially
    errorMessages.forEach((message) => {
      expect(message).toBeEmptyDOMElement();
    });

    await user.click(getByRole("button", { name: /Save/ }));

    // Error wrappers persist
    errorMessages = getAllByTestId(/error-message-input/);
    expect(errorMessages).toHaveLength(numberOfErrors);

    // Each field is in an error state, ignoring individual date input fields
    const fieldErrors = errorMessages.slice(
      0,
      mockZooProps.schema.fields.length,
    );

    fieldErrors.forEach((message) => {
      expect(message).not.toBeEmptyDOMElement();
    });
  });

  /**
   * These tests are not exhaustive tests of validation schemas, these can be tested in their respective model.test.ts files
   * We are testing that the validation schemas are correctly "wired up" to out List component fields
   */
  describe("existing validation schemas are correctly referenced", () => {
    test("text fields", async () => {
      const { user, getByRole, getByTestId } = setup(
        <ListComponent {...mockZooProps} />,
      );

      const nameInput = screen.getByLabelText(/name/);
      await user.type(
        nameInput,
        "This is a long string of text over one hundred and twenty characters, which should trigger the 'short' text validation warning",
      );
      await user.click(getByRole("button", { name: /Save/ }));

      const nameInputErrorMessage = getByTestId(
        /error-message-input-text-name/,
      );

      expect(nameInputErrorMessage).toHaveTextContent(
        /Your answer must be 120 characters or fewer/,
      );
    });

    test("number fields", async () => {
      const { user, getByRole, getByTestId } = setup(
        <ListComponent {...mockZooProps} />,
      );

      const ageInput = screen.getByLabelText(/old/);
      await user.type(ageInput, "-35");
      await user.click(getByRole("button", { name: /Save/ }));

      const ageInputErrorMessage = getByTestId(
        /error-message-input-number-age/,
      );

      expect(ageInputErrorMessage).toHaveTextContent(/Enter a positive number/);
    });

    test("question fields", async () => {
      const { user, getByRole, getByTestId } = setup(
        <ListComponent {...mockZooProps} />,
      );

      await user.click(getByRole("button", { name: /Save/ }));

      const sizeInputErrorMessage = getByTestId(
        /error-message-input-question-size/,
      );

      expect(sizeInputErrorMessage).toHaveTextContent(
        /Select your answer before continuing/,
      );
    });

    test("radio fields", async () => {
      const { user, getByRole, getByTestId } = setup(
        <ListComponent {...mockZooProps} />,
      );

      await user.click(getByRole("button", { name: /Save/ }));

      const cuteInputErrorMessage = getByTestId(
        /error-message-input-question-cute/,
      );

      expect(cuteInputErrorMessage).toHaveTextContent(
        /Select your answer before continuing/,
      );
    });

    test("checklist fields", async () => {
      const { user, getByRole, getByTestId } = setup(
        <ListComponent {...mockZooProps} />,
      );

      await user.click(getByRole("button", { name: /Save/ }));

      const foodInputErrorMessage = getByTestId(
        /error-message-input-checklist-food/,
      );

      expect(foodInputErrorMessage).toHaveTextContent(
        /Select at least one option/,
      );
    });

    test("date fields", async () => {
      const { user, getByRole, getAllByTestId } = setup(
        <ListComponent {...mockZooProps} />,
      );

      await user.click(getByRole("button", { name: /Save/ }));

      const dateInputErrorMessage = getAllByTestId(
        /error-message-input-date-birthday/,
      )[0];

      expect(dateInputErrorMessage).toHaveTextContent(
        /Date must include a day/,
      );
    });
  });

  test("an error displays if the minimum number of items is not met", async () => {
    const { user, getByRole, getByTestId, getByText } = setup(
      <ListComponent {...mockZooProps} />,
    );

    const minNumberOfItems = mockZooProps.schema.min;
    expect(minNumberOfItems).toEqual(1);

    await user.click(getByRole("button", { name: /Cancel/ }));
    await user.click(getByTestId("continue-button"));

    const minItemsErrorMessage = getByText(
      `You must provide at least ${minNumberOfItems} response(s)`,
    );
    expect(minItemsErrorMessage).toBeVisible();
  });

  test(
    "an error displays if the maximum number of items is exceeded",
    { timeout: 20000 },
    async () => {
      const { user, getAllByTestId, getByTestId, getByText } = setup(
        <ListComponent {...mockZooProps} />,
      );
      const addItemButton = getByTestId(/list-add-button/);

      const maxNumberOfItems = mockZooProps.schema.max;
      expect(maxNumberOfItems).toEqual(3);

      // Complete three items
      await fillInResponse(user);
      await user.click(addItemButton);
      await fillInResponse(user);
      await user.click(addItemButton);
      await fillInResponse(user);

      const cards = getAllByTestId(/list-card/);
      expect(cards).toHaveLength(3);

      // Try to add a fourth
      await user.click(getByTestId(/list-add-button/));

      const maxItemsErrorMessage = getByText(
        `You can provide at most ${maxNumberOfItems} response(s)`,
      );
      expect(maxItemsErrorMessage).toBeVisible();
    },
  );

  test("an error displays if you add a new item, without saving the active item", async () => {
    const { user, getByTestId, getByText, getByLabelText } = setup(
      <ListComponent {...mockZooProps} />,
    );
    // Start filling out item
    const nameInput = getByLabelText(/name/);
    await user.type(nameInput, "Richard Parker");

    const emailInput = getByLabelText(/email/);
    await user.type(emailInput, "richard.parker@pi.com");

    // Try to add a new item
    await user.click(getByTestId(/list-add-button/));

    const activeItemErrorMessage = getByText(
      /Please save all responses before adding another/,
    );
    expect(activeItemErrorMessage).toBeVisible();
  });

  test("an error displays if you continue, without saving the active item", async () => {
    const { user, getByTestId, getByText, getByLabelText } = setup(
      <ListComponent {...mockZooProps} />,
    );
    // Start filling out item
    const nameInput = getByLabelText(/name/);
    await user.type(nameInput, "Richard Parker");

    const emailInput = getByLabelText(/email/);
    await user.type(emailInput, "richard.parker@pi.com");

    // Try to continue
    await user.click(getByTestId(/continue-button/));

    const unsavedItemErrorMessage = getByText(
      /Please save in order to continue/,
    );
    expect(unsavedItemErrorMessage).toBeVisible();
  });
});

test("Input data is displayed in the inactive card view", async () => {
  const { getByText, user } = setup(<ListComponent {...mockZooProps} />);

  await fillInResponse(user);

  // Text input
  expect(getByText("What's their name?", { selector: "td" })).toBeVisible();
  expect(getByText("Richard Parker", { selector: "td" })).toBeVisible();

  // Email input
  expect(
    getByText("What's their email address?", { selector: "td" }),
  ).toBeVisible();
  expect(getByText("richard.parker@pi.com", { selector: "td" })).toBeVisible();

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
});

describe("Payload generation", () => {
  it(
    "generates a valid payload on submission (Zoo)",
    { timeout: 20000 },
    async () => {
      const handleSubmit = vi.fn();
      const { getByTestId, user } = setup(
        <ListComponent {...mockZooProps} handleSubmit={handleSubmit} />,
      );
      const addItemButton = getByTestId("list-add-button");

      await fillInResponse(user);

      await user.click(addItemButton);
      await fillInResponse(user);

      await user.click(screen.getByTestId("continue-button"));

      expect(handleSubmit).toHaveBeenCalled();
      expect(handleSubmit.mock.calls[0][0]).toMatchObject(mockZooPayload);
    },
  );

  it(
    "generates a valid payload with summary stats on submission (Units)",
    { timeout: 20000 },
    async () => {
      const handleSubmit = vi.fn();
      const { getByTestId, user, getByRole, getAllByRole, getByLabelText } =
        setup(
          <ListComponent {...mockUnitsProps} handleSubmit={handleSubmit} />,
        );

      const addItemButton = getByTestId("list-add-button");

      // Response 1
      let saveButton = getByRole("button", { name: /Save/ });
      let developmentSelect = getByRole("combobox");
      let gardenYesRadio = getAllByRole("radio")[0];
      let gardenNoRadio = getAllByRole("radio")[1];
      let unitsNumberInput = getByLabelText(/identical units/);

      await user.click(developmentSelect);
      await user.click(getByRole("option", { name: /New build/ }));
      await user.click(gardenYesRadio);
      await user.type(unitsNumberInput, "1");
      await user.click(saveButton);

      // Response 2
      await user.click(addItemButton);

      saveButton = getByRole("button", { name: /Save/ });
      developmentSelect = getByRole("combobox");
      gardenYesRadio = getAllByRole("radio")[0];
      gardenNoRadio = getAllByRole("radio")[1];
      unitsNumberInput = getByLabelText(/identical units/);

      await user.click(developmentSelect);
      await user.click(getByRole("option", { name: /New build/ }));
      await user.click(gardenNoRadio);
      await user.type(unitsNumberInput, "2");
      await user.click(saveButton);

      // Response 3
      await user.click(addItemButton);

      saveButton = getByRole("button", { name: /Save/ });
      developmentSelect = getByRole("combobox");
      gardenYesRadio = getAllByRole("radio")[0];
      gardenNoRadio = getAllByRole("radio")[1];
      unitsNumberInput = getByLabelText(/identical units/);

      await user.click(developmentSelect);
      await user.click(
        getByRole("option", { name: /Change of use to a home/ }),
      );
      await user.click(gardenNoRadio);
      await user.type(unitsNumberInput, "2");
      await user.click(saveButton);

      await user.click(getByTestId("continue-button"));

      expect(handleSubmit).toHaveBeenCalled();
      const output = handleSubmit.mock.calls[0][0];
      expect(output).toMatchObject(mockUnitsPayload);
    },
  );
});

describe("Navigating back", () => {
  test("it pre-populates list correctly", async () => {
    const { getAllByText, queryByLabelText, getAllByTestId } = setup(
      <ListComponent
        {...mockZooProps}
        previouslySubmittedData={mockZooPayload}
      />,
    );

    const cards = getAllByTestId(/list-card/);

    // Two cards
    expect(cards).toHaveLength(2);

    // Both inactive
    expect(queryByLabelText(/What's their name?/)).toBeNull();
    expect(getAllByText(/What's their name?/)).toHaveLength(2);

    // With the correct previous data
    expect(getAllByText(/Richard Parker/)).toHaveLength(2);
  });
});

/**
 * Helper function to fill out a list item form
 */
const fillInResponse = async (user: UserEvent) => {
  const nameInput = screen.getByLabelText(/name/);
  await user.type(nameInput, "Richard Parker");

  const emailInput = screen.getByLabelText(/email/);
  await user.type(emailInput, "richard.parker@pi.com");

  const ageInput = screen.getByLabelText(/old/);
  await user.type(ageInput, "10");

  const sizeSelect = screen.getByRole("combobox");
  await user.click(sizeSelect);
  await user.click(screen.getByRole("option", { name: /Medium/ }));

  const cuteRadio = screen.getAllByRole("radio")[0];
  await user.click(cuteRadio);

  const eatCheckboxes = screen.getAllByRole("checkbox");
  await user.click(eatCheckboxes[0]);
  await user.click(eatCheckboxes[1]);
  await user.click(eatCheckboxes[2]);

  const dayInput = screen.getByLabelText("Day");
  const monthInput = screen.getByLabelText("Month");
  const yearInput = screen.getByLabelText("Year");
  await user.type(dayInput, "14");
  await user.type(monthInput, "7");
  await user.type(yearInput, "1988");

  const saveButton = screen.getByRole("button", {
    name: /Save/,
  });
  await user.click(saveButton);
};
