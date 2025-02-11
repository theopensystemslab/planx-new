import { screen } from "@testing-library/react";
import React from "react";
import { setup } from "testUtils";
import { it, vi } from "vitest";

import {
  mockUnitsPayload,
  mockUnitsProps,
} from "../../schemas/mocks/GenericUnits";
import { mockZooPayload, mockZooProps } from "../../schemas/mocks/Zoo";
import ListComponent from "..";
import { fillInResponse } from "./testUtils";

Element.prototype.scrollIntoView = vi.fn();

describe("Payload generation", () => {
  it(
    "generates a valid payload on submission (Zoo)",
    { timeout: 35_000 },
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
    { timeout: 35_000 },
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
