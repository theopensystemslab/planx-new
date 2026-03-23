import { within } from "@testing-library/react";
import { uploadPrivateFile } from "lib/api/fileUpload/requests";
import { cloneDeep, merge } from "lodash";
import React from "react";
import { setup } from "testUtils";
import { it, test, vi } from "vitest";

import { mockMaxOneProps } from "../../schemas/mocks/MaxOne";
import { mockZooProps } from "../../schemas/mocks/Zoo/props";
import ListComponent from "..";
import { fillInResponse } from "./testUtils";

Element.prototype.scrollIntoView = vi.fn();

vi.mock("lib/api/fileUpload/requests");
const mockedUploadPrivateFile = vi.mocked(uploadPrivateFile, true);

beforeEach(() => {
  mockedUploadPrivateFile.mockClear();
});

describe("Building a list", () => {
  it("does not display a default item if the schema has no required minimum", async () => {
    const mockWithMinZero = merge(cloneDeep(mockZooProps), {
      schema: { min: 0 },
    });
    const { queryByRole, getByTestId } = await setup(
      <ListComponent {...mockWithMinZero} />,
    );

    // No card present
    const activeListHeading = queryByRole("heading", {
      level: 2,
      name: "Animal 1",
    });
    expect(activeListHeading).not.toBeInTheDocument();

    // Button is present allow additional items to be added
    const addItemButton = getByTestId("list-add-button");
    expect(addItemButton).toBeInTheDocument();
    expect(addItemButton).toBeEnabled();
  });

  it("displays a default item if the schema has a required minimum", async () => {
    const { getByRole, queryByLabelText } = await setup(
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
    expect(inputField).toBeEnabled();
  });

  it("hides the index number in the card header and the 'add another' button if the schema has a max of 1", async () => {
    const { getAllByTestId, queryByTestId } = await setup(
      <ListComponent {...mockMaxOneProps} />,
    );

    const cards = getAllByTestId(/list-card/);
    expect(cards).toHaveLength(1);
    expect(cards[0]).toHaveTextContent("Parking spaces");

    const addItemButton = queryByTestId("list-add-button");
    expect(addItemButton).not.toBeInTheDocument();
  });

  test("Adding an item", { timeout: 35_000 }, async () => {
    const { getAllByTestId, getByTestId, user } = await setup(
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
    expect(firstCard).toBeInTheDocument();
    expect(
      within(firstCard!).queryByLabelText(/What's their name?/),
    ).not.toBeInTheDocument();

    // New item is active
    expect(secondCard).toBeInTheDocument();
    expect(
      within(secondCard!).getByLabelText(/What's their name?/),
    ).toBeInTheDocument();
  });

  test("Editing an item", { timeout: 45_000 }, async () => {
    // Setup three cards
    const { getAllByTestId, getByTestId, user } = await setup(
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
    ).not.toBeInTheDocument();
    expect(
      within(secondCard!).queryByLabelText(/What's their name?/),
    ).not.toBeInTheDocument();
    expect(
      within(thirdCard!).queryByLabelText(/What's their name?/),
    ).not.toBeInTheDocument();

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
    { timeout: 35_000 },
    async () => {
      // Setup three cards
      const {
        getByTestId,
        getAllByTestId,
        user,
        getByLabelText,
        queryAllByTestId,
      } = await setup(<ListComponent {...mockZooProps} />);

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
      ).not.toBeInTheDocument();
      expect(
        within(secondCard!).queryByLabelText(/What's their name?/),
      ).not.toBeInTheDocument();

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
      ).not.toBeInTheDocument();

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
    { timeout: 35_000 },
    async () => {
      // Setup two cards
      const { getAllByTestId, getByTestId, user } = await setup(
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

  test(
    "Cancelling an invalid (new) item removes it",
    { timeout: 35_000 },
    async () => {
      const { getAllByTestId, getByText, user, queryAllByTestId, getByTestId } =
        await setup(<ListComponent {...mockZooProps} />);

      let cards = getAllByTestId(/list-card/);
      expect(cards).toHaveLength(1);

      // "Cancel" is hidden from initial item, so fill out an item first
      await fillInResponse(user);

      const addItemButton = getByTestId("list-add-button");
      await user.click(addItemButton);

      const [_firstCard, secondCard] = getAllByTestId(/list-card/);

      // Second card is active
      expect(
        within(secondCard!).getByLabelText(/What's their name?/),
      ).toBeInTheDocument();

      const cancelButton = getByText(/Cancel/, { selector: "button" });
      await user.click(cancelButton);

      cards = queryAllByTestId(/list-card/);
      expect(cards).toHaveLength(1);
    },
  );

  test(
    "Cancelling a valid (existing) item resets previous state",
    { timeout: 35_000 },
    async () => {
      const {
        getByLabelText,
        getByText,
        user,
        queryByText,
        getByTestId,
        getAllByTestId,
        getAllByText,
      } = await setup(<ListComponent {...mockZooProps} />);

      await fillInResponse(user);

      const addItemButton = getByTestId("list-add-button");
      await user.click(addItemButton);

      const [_firstCard, secondCard] = getAllByTestId(/list-card/);

      // Second card is active
      expect(
        within(secondCard!).getByLabelText(/What's their name?/),
      ).toBeInTheDocument();

      // "Cancel" button was hidden on first item, so fill in second item
      await fillInResponse(user);

      const secondEmail = getAllByText("richard.parker@pi.com")[1];
      expect(secondEmail).toBeInTheDocument();

      const secondEditButton = getAllByText(/Edit/, { selector: "button" })[1];
      await user.click(secondEditButton);

      const emailInput = getByLabelText(/email/);
      await user.type(emailInput, "my.new.email@test.com");

      const secondCancelButton = getAllByText(/Cancel/, {
        selector: "button",
      })[1];
      await user.click(secondCancelButton);

      expect(queryByText("my.new.email@test.com")).not.toBeInTheDocument();
      expect(getByText("richard.parker@pi.com")).toBeInTheDocument();
    },
  );
});
