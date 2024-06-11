import { screen, within } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";
import { cloneDeep, merge } from "lodash";
import React from "react";
import { axe, setup } from "testUtils";

import { UserResponse } from "../model";
import ListComponent, { Props } from "../Public";
import { GenericUnitsTest } from "../schemas/GenericUnitsTest";
import { Zoo } from "../schemas/Zoo";
import {
  flatten,
  sumIdenticalUnits,
  sumIdenticalUnitsByDevelopmentType,
} from "../utils";

const mockProps: Props = {
  fn: "mockFn",
  schema: Zoo,
  schemaName: "Zoo",
  title: "Mock Title",
  description: "Mock description",
};

const mockPayload = {
  data: {
    mockFn: [
      {
        age: 10,
        cuteness: "Very",
        email: "richard.parker@pi.com",
        name: "Richard Parker",
        size: "Medium",
      },
      {
        age: 10,
        cuteness: "Very",
        email: "richard.parker@pi.com",
        name: "Richard Parker",
        size: "Medium",
      },
    ],
    "mockFn.one.age": 10,
    "mockFn.one.cuteness": "Very",
    "mockFn.one.email": "richard.parker@pi.com",
    "mockFn.one.name": "Richard Parker",
    "mockFn.one.size": "Medium",
    "mockFn.two.age": 10,
    "mockFn.two.cuteness": "Very",
    "mockFn.two.email": "richard.parker@pi.com",
    "mockFn.two.name": "Richard Parker",
    "mockFn.two.size": "Medium",
    "mockFn.total.listItems": 2,
  },
};

const mockPropsUnits: Props = {
  fn: "proposal.units.residential",
  schema: GenericUnitsTest,
  schemaName: "Generic residential units",
  title: "Describe residential units",
};

const mockPayloadUnits = {
  data: {
    "proposal.units.residential": [
      {
        development: "newBuild",
        garden: "Yes",
        identicalUnits: 1,
      },
      {
        development: "newBuild",
        garden: "No",
        identicalUnits: 2,
      },
      {
        development: "changeOfUseTo",
        garden: "No",
        identicalUnits: 2,
      },
    ],
    "proposal.units.residential.one.development": "newBuild",
    "proposal.units.residential.one.garden": "Yes",
    "proposal.units.residential.one.identicalUnits": 1,
    "proposal.units.residential.two.development": "newBuild",
    "proposal.units.residential.two.garden": "No",
    "proposal.units.residential.two.identicalUnits": 2,
    "proposal.units.residential.three.development": "changeOfUseTo",
    "proposal.units.residential.three.garden": "No",
    "proposal.units.residential.three.identicalUnits": 2,
    "proposal.units.residential.total.listItems": 3,
    "proposal.units.residential.total.units": 5,
    "proposal.units.residential.total.units.newBuid": 3,
    "proposal.units.residential.total.units.changeOfUseTo": 2,
  },
};

jest.setTimeout(20_000);

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

describe("Building a list", () => {
  it("does not display a default item if the schema has no required minimum", () => {
    const mockWithMinZero = merge(cloneDeep(mockProps), { schema: { min: 0 } });
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
      <ListComponent {...mockProps} />,
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

  test("Adding an item", async () => {
    const { getAllByTestId, getByTestId, user } = setup(
      <ListComponent {...mockProps} />,
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

  test("Editing an item", async () => {
    // Setup three cards
    const { getAllByTestId, getByTestId, user } = setup(
      <ListComponent {...mockProps} />,
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

  test("Removing an item when all cards are inactive", async () => {
    // Setup three cards
    const {
      getByTestId,
      getAllByTestId,
      user,
      getByLabelText,
      queryAllByTestId,
    } = setup(<ListComponent {...mockProps} />);

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
  });

  test("Removing an item when another card is active", async () => {
    // Setup two cards
    const { getAllByTestId, getByTestId, user } = setup(
      <ListComponent {...mockProps} />,
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
  });
});

describe("Form validation and error handling", () => {
  test.todo("form validation is triggered when saving an item");
  test.todo("text fields use existing validation schemas");
  test.todo("number fields use existing validation schemas");
  test.todo("question fields use validation schema");
  test.todo("unique constraints are enforced on question where this is set");
  test.todo("optional fields can be empty when saving an item");
  test.todo("an error displays if the minimum number of items is not met");
  test.todo("an error displays if the maximum number of items is exceeded");
  test.todo(
    "an error displays if you add a new item, without saving the active item",
  );
  test.todo(
    "an error displays if you continue, without saving the active item",
  );
});

describe("Payload generation", () => {
  it("generates a valid payload on submission (Zoo)", async () => {
    const handleSubmit = jest.fn();
    const { getByTestId, user } = setup(
      <ListComponent {...mockProps} handleSubmit={handleSubmit} />,
    );
    const addItemButton = getByTestId("list-add-button");

    await fillInResponse(user);

    await user.click(addItemButton);
    await fillInResponse(user);

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit.mock.calls[0][0]).toMatchObject(mockPayload);
  });

  it.skip("generates a valid payload with summary stats on submission (Units)", async () => {
    const handleSubmit = jest.fn();
    const { getByTestId, user } = setup(
      <ListComponent {...mockPropsUnits} handleSubmit={handleSubmit} />,
    );

    const saveButton = screen.getByRole("button", { name: /Save/ });
    const addItemButton = getByTestId("list-add-button");
    const developmentSelect = screen.getByRole("combobox");
    const gardenYesRadio = screen.getAllByRole("radio")[0];
    const gardenNoRadio = screen.getAllByRole("radio")[1];
    const unitsNumberInput = screen.getByLabelText(/identical units/);

    // Response 1
    await user.click(developmentSelect);
    await user.click(screen.getByRole("option", { name: /New build/ }));
    await user.click(gardenYesRadio);
    await user.type(unitsNumberInput, "1");
    await user.click(saveButton);

    // Response 2
    await user.click(addItemButton);
    await user.click(developmentSelect);
    await user.click(screen.getByRole("option", { name: /New build/ }));
    await user.click(gardenNoRadio);
    await user.type(unitsNumberInput, "2");
    await user.click(saveButton);

    // Response 3
    await user.click(addItemButton);
    await user.click(developmentSelect);
    await user.click(
      screen.getByRole("option", { name: /Change of use to a home/ }),
    );
    await user.click(gardenNoRadio);
    await user.type(unitsNumberInput, "2");
    await user.click(saveButton);

    await user.click(screen.getByTestId("continue-button"));

    expect(handleSubmit).toHaveBeenCalled();
    expect(handleSubmit.mock.calls[0][0]).toMatchObject(mockPayloadUnits);
  });
});

describe("Navigating back", () => {
  test("it pre-populates list correctly", async () => {
    const { getAllByText, queryByLabelText, getAllByTestId } = setup(
      <ListComponent {...mockProps} previouslySubmittedData={mockPayload} />,
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

  const saveButton = screen.getByRole("button", {
    name: /Save/,
  });
  await user.click(saveButton);
};
