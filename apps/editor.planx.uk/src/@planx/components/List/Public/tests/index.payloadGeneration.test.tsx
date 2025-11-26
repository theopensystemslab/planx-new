import { screen } from "@testing-library/react";
import { uploadPrivateFile } from "lib/api/fileUpload/requests";
import React from "react";
import { setup } from "testUtils";
import { it, vi } from "vitest";

import {
  mockUnitsPayload,
  mockUnitsProps,
} from "../../schemas/mocks/GenericUnits";
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

describe("Payload generation", () => {
  it(
    "generates a valid payload on submission (Zoo)",
    { timeout: 35_000 },
    async () => {
      const handleSubmit = vi.fn();
      const { getByTestId, user } = await setup(
        <ListComponent {...mockZooProps} handleSubmit={handleSubmit} />,
      );
      const addItemButton = getByTestId("list-add-button");

      await fillInResponse(user);

      await user.click(addItemButton);
      await fillInResponse(user);

      await user.click(screen.getByTestId("continue-button"));

      expect(handleSubmit).toHaveBeenCalled();
      const result: typeof mockZooPayload = handleSubmit.mock.calls[0][0];
      expect(result).toMatchObject(mockZooPayload);

      // All FileUploadField values are merged (2 files for each of the 2 list items)
      expect(result.data["photographs.existing"]).toHaveLength(4);

      // Responses from FileUploadFields are extracted to the root level of the passport
      expect(result.data["photographs.existing"][0].id).toEqual(
        result.data.mockFn[0]["photographs.existing"][0].id,
      );
      expect(result.data["photographs.existing"][1].id).toEqual(
        result.data.mockFn[0]["photographs.existing"][1].id,
      );
      expect(result.data["photographs.existing"][2].id).toEqual(
        result.data.mockFn[1]["photographs.existing"][0].id,
      );
      expect(result.data["photographs.existing"][3].id).toEqual(
        result.data.mockFn[1]["photographs.existing"][1].id,
      );
    },
  );

  it(
    "generates a valid payload with summary stats on submission (Units)",
    { timeout: 35_000 },
    async () => {
      const handleSubmit = vi.fn();
      const { getByTestId, user, getByRole, getAllByRole, getByLabelText } =
        await setup(
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
