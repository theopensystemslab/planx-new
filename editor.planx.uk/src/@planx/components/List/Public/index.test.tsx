import { within } from "@testing-library/react";
import { cloneDeep, merge } from "lodash";
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
  it("does not display a default item if the schema has no required minimum", () => {
    const mockWithMinZero = merge(cloneDeep(mockProps), { schema: { min: 0 } });
    const { queryByRole, getByRole } = setup(
      <ListComponent {...mockWithMinZero} />,
    );

    // No card present
    const activeListHeading = queryByRole("heading", {
      level: 2,
      name: "Animal 1",
    });
    expect(activeListHeading).toBeNull();

    // Button is present allow additional items to be added
    const addItemButton = getByRole("button", {
      name: /Add a new animal type/,
    });
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
    const { getAllByRole, getByRole, user } = setup(
      <ListComponent {...mockProps} />,
    );

    let cards = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );
    expect(cards).toHaveLength(1);

    const addItemButton = getByRole("button", {
      name: /Add a new animal type/,
    });
    await user.click(addItemButton);

    // Item successfully added
    cards = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );
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
    const { getAllByRole, getByRole, user, findByLabelText } = setup(
      <ListComponent {...mockProps} />,
    );

    const addItemButton = getByRole("button", {
      name: /Add a new animal type/,
    });
    await user.click(addItemButton);
    await user.click(addItemButton);

    let cards = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );
    expect(cards).toHaveLength(3);

    let [firstCard, secondCard, thirdCard] = cards;

    // Final card is currently active
    expect(thirdCard).not.toBeNull();
    expect(
      within(thirdCard!).getByLabelText(/What's their name?/),
    ).toBeInTheDocument();

    // Hitting "cancel" takes us out of Edit mode
    const thirdCardCancelButton = within(thirdCard!).getByRole("button", {
      name: /Cancel/,
    });
    await user.click(thirdCardCancelButton);

    cards = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );
    [firstCard, secondCard, thirdCard] = cards;

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

    cards = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );
    [firstCard, secondCard, thirdCard] = cards;

    // Second card now editable
    expect(
      within(secondCard!).getByLabelText(/What's their name?/),
    ).toBeInTheDocument();
  });

  test("Removing an item when all cards are inactive", async () => {
    // Setup three cards
    const { getAllByRole, getByRole, user, getByLabelText, queryAllByRole } =
      setup(<ListComponent {...mockProps} />);

    const addItemButton = getByRole("button", {
      name: /Add a new animal type/,
    });
    await user.click(addItemButton);
    await user.click(addItemButton);

    let cards = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );
    expect(cards).toHaveLength(3);

    let [firstCard, secondCard, thirdCard] = cards;

    const thirdCardCancelButton = within(thirdCard!).getByRole("button", {
      name: /Cancel/,
    });
    await user.click(thirdCardCancelButton);

    [firstCard, secondCard, thirdCard] = getAllByRole("heading", {
      level: 2,
    }).map((el) => el.closest("div"));

    // Remove third card
    const thirdCardRemoveButton = within(thirdCard!).getByRole("button", {
      name: /Remove/,
    });
    await user.click(thirdCardRemoveButton);
    cards = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );
    expect(cards).toHaveLength(2);

    [firstCard, secondCard] = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );

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
    cards = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );
    expect(cards).toHaveLength(1);

    [firstCard] = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );

    // Previous items remain inactive
    expect(
      within(firstCard!).queryByLabelText(/What's their name?/),
    ).toBeNull();

    // Remove first card
    const firstCardRemoveButton = within(firstCard!).getByRole("button", {
      name: /Remove/,
    });
    await user.click(firstCardRemoveButton);
    cards = queryAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );
    expect(cards).toHaveLength(0);

    // Add item back
    await user.click(addItemButton);

    // This is now editable and active
    const newFirstCardInput = getByLabelText(/What's their name?/);
    expect(newFirstCardInput).toBeInTheDocument();
  });

  test("Removing an item when another card is active", async () => {
    // Setup two cards
    const { getAllByRole, getByRole, user, getByLabelText, queryAllByRole } =
      setup(<ListComponent {...mockProps} />);

    const addItemButton = getByRole("button", {
      name: /Add a new animal type/,
    });
    await user.click(addItemButton);

    const [firstCard, secondCard] = getAllByRole("heading", { level: 2 }).map(
      (el) => el.closest("div"),
    );

    // Second card is active
    expect(
      within(secondCard!).getByLabelText(/What's their name?/),
    ).toBeInTheDocument();

    // Remove first
    const firstCardRemoveButton = within(firstCard!).getByRole("button", {
      name: /Remove/,
    });
    await user.click(firstCardRemoveButton);
    const cards = getAllByRole("heading", { level: 2 }).map((el) =>
      el.closest("div"),
    );
    expect(cards).toHaveLength(1);

    // First card is active
    expect(
      within(cards[0]!).getByLabelText(/What's their name?/),
    ).toBeInTheDocument();
  });
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
