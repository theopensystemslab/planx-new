import { screen, waitFor } from "@testing-library/react";
import { uploadPrivateFile } from "lib/api/fileUpload/requests";
import { cloneDeep, merge } from "lodash";
import React from "react";
import { setup } from "testUtils";
import { test, vi } from "vitest";

import { mockZooProps } from "../../schemas/mocks/Zoo/props";
import ListComponent from "..";
import { fillInResponse } from "./testUtils";

Element.prototype.scrollIntoView = vi.fn();

vi.mock("lib/api/fileUpload/requests");
const mockedUploadPrivateFile = vi.mocked(uploadPrivateFile, true);

beforeEach(() => {
  mockedUploadPrivateFile.mockClear();
});

describe("Form validation and error handling", () => {
  test(
    "form validation is triggered when saving an item",
    { timeout: 35_000 },
    async () => {
      const { user, getByRole, getAllByTestId } = await setup(
        <ListComponent {...mockZooProps} />,
      );

      let errorMessages = getAllByTestId(/error-message-input/);

      let numberOfErrors = 0;
      mockZooProps.schema.fields.forEach((field) => {
        switch (field.type) {
          case "date":
            // Parent wrapper + 3 inputs
            numberOfErrors += 4;
            break;
          case "address":
            // 3 mandatory fields
            numberOfErrors += 3;
            break;
          default:
            numberOfErrors += 1;
            break;
        }
      });

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

      // Each field is in an error state, ignoring additional error wrappers for date, address, and fileUpload components
      const fieldErrors = errorMessages.slice(
        0,
        mockZooProps.schema.fields.length - 2,
      );

      fieldErrors.forEach((message) => {
        expect(message).not.toBeEmptyDOMElement();
      });
    },
  );

  /**
   * These tests are not exhaustive tests of validation schemas, these can be tested in their respective model.test.ts files
   * We are testing that the validation schemas are correctly "wired up" to out List component fields
   */
  describe("existing validation schemas are correctly referenced", () => {
    test("text fields", { timeout: 20_000 }, async () => {
      const { user, getByRole, getByTestId } = await setup(
        <ListComponent {...mockZooProps} />,
      );

      const nameInput = screen.getByLabelText(/What's their name/);
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

    test("number fields", { timeout: 20_000 }, async () => {
      const { user, getByRole, getByTestId } = await setup(
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

    test("question fields", { timeout: 20_000 }, async () => {
      const { user, getByRole, getByTestId } = await setup(
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

    test("radio fields", { timeout: 20_000 }, async () => {
      const { user, getByRole, getByTestId } = await setup(
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

    test("checklist fields", { timeout: 20_000 }, async () => {
      const { user, getByRole, getByTestId } = await setup(
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

    test("date fields", { timeout: 20_000 }, async () => {
      const { user, getByRole, getAllByTestId } = await setup(
        <ListComponent {...mockZooProps} />,
      );

      await user.click(getByRole("button", { name: /Save/ }));

      const dateInputErrorMessage = getAllByTestId(
        /error-message-input-date-birthday/,
      )[0];

      expect(dateInputErrorMessage).toHaveTextContent(
        /Enter a valid date in DD.MM.YYYY format/,
      );
    });

    test.todo("map fields");

    test("address fields", { timeout: 20_000 }, async () => {
      const { user, getByRole, getAllByTestId } = await setup(
        <ListComponent {...mockZooProps} />,
      );

      await user.click(getByRole("button", { name: /Save/ }));

      const addressInputErrorMessage = getAllByTestId(
        /error-message-input-address-address-line1/,
      )[0];

      expect(addressInputErrorMessage).toHaveTextContent(
        /Enter the first line of an address/,
      );
    });

    test("file upload fields", { timeout: 20_000 }, async () => {
      const { user, getByRole, getByTestId } = await setup(
        <ListComponent {...mockZooProps} />,
      );

      await user.click(getByRole("button", { name: /Save/ }));

      const sizeInputErrorMessage = getByTestId(
        /error-message-input-fileUpload/,
      );

      expect(sizeInputErrorMessage).toHaveTextContent(
        /Upload at least one file/,
      );
    });
  });

  test(
    "an error displays if the minimum number of items is not met",
    { timeout: 20_000 },
    async () => {
      const mockWithMinTwo = merge(cloneDeep(mockZooProps), {
        schema: { min: 2 },
      });
      const { user, getByTestId, getByText } = await setup(
        <ListComponent {...mockWithMinTwo} />,
      );

      const minNumberOfItems = mockWithMinTwo.schema.min;
      expect(minNumberOfItems).toEqual(2);

      // Fill in one response only
      await fillInResponse(user);

      await user.click(getByTestId("continue-button"));

      const minItemsErrorMessage = getByText(
        `Error: You must provide at least ${minNumberOfItems} response(s)`,
      );
      expect(minItemsErrorMessage).toBeVisible();
    },
  );

  test(
    "an error displays if the maximum number of items is exceeded",
    { timeout: 40_000 },
    async () => {
      const { user, getAllByTestId, getByTestId, getByText } = await setup(
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
      waitFor(() => expect(cards).toHaveLength(3));

      // Try to add a fourth
      await user.click(getByTestId(/list-add-button/));
      waitFor(() => {
        const maxItemsErrorMessage = getByText(
          `Error: You can provide at most ${maxNumberOfItems} response(s)`,
        );
        expect(maxItemsErrorMessage).toBeVisible();
      });
    },
  );

  test(
    "an error displays if you add a new item, without saving the active item",
    { timeout: 35_000 },
    async () => {
      const { user, getByTestId, getByText, getByLabelText } = await setup(
        <ListComponent {...mockZooProps} />,
      );
      // Start filling out item
      const nameInput = getByLabelText(/What's their name/);
      await user.type(nameInput, "Richard Parker");

      const emailInput = getByLabelText(/email/);
      await user.type(emailInput, "richard.parker@pi.com");

      // Try to add a new item
      await user.click(getByTestId(/list-add-button/));

      const activeItemErrorMessage = getByText(
        /Please save all responses before adding another/,
      );
      expect(activeItemErrorMessage).toBeVisible();
    },
  );

  test(
    "an error displays if you continue, without saving the active item",
    { timeout: 35_000 },
    async () => {
      const { user, getByTestId, getByText, getByLabelText } = await setup(
        <ListComponent {...mockZooProps} />,
      );
      // Start filling out item
      const nameInput = getByLabelText(/What's their name/);
      await user.type(nameInput, "Richard Parker");

      const emailInput = getByLabelText(/email/);
      await user.type(emailInput, "richard.parker@pi.com");

      // Try to continue
      await user.click(getByTestId(/continue-button/));

      const unsavedItemErrorMessage = getByText(
        /Please save in order to continue/,
      );
      expect(unsavedItemErrorMessage).toBeVisible();
    },
  );
});
