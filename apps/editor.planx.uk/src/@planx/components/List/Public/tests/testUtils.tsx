import { screen, waitFor } from "@testing-library/react";
// eslint-disable-next-line no-restricted-imports
import type { UserEvent } from "@testing-library/user-event";
import { uploadPrivateFile } from "lib/api/fileUpload/requests";
import { vi } from "vitest";

global.URL.createObjectURL = vi.fn();

const mockedUploadPrivateFile = vi.mocked(uploadPrivateFile);

/**
 * Helper function to fill out a list item form
 * XXX: user.paste() is significantly more preformant that user.type()
 * This is a worthwile optimisation as this helper is called many times
 */
export const fillInResponse = async (user: UserEvent) => {
  const nameInput = screen.getByLabelText(/What's their name/);
  await user.click(nameInput);
  await user.paste("Richard Parker");

  const emailInput = screen.getByLabelText(/email/);
  await user.click(emailInput);
  await user.paste("richard.parker@pi.com");

  const ageInput = screen.getByLabelText(/old/);
  await user.click(ageInput);
  await user.paste("10");

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
  await user.click(dayInput);
  await user.paste("14");
  await user.click(monthInput);
  await user.paste("7");
  await user.click(yearInput);
  await user.paste("1988");

  const line1Input = screen.getByLabelText("Address line 1");
  const line2Input = screen.getByLabelText("Address line 2 (optional)");
  const townInput = screen.getByLabelText("Town");
  const countyInput = screen.getByLabelText("County (optional)");
  const postcodeInput = screen.getByLabelText("Postcode");
  const countryInput = screen.getByLabelText("Country (optional)");
  await user.click(line1Input);
  await user.paste("134 Corstorphine Rd");
  await user.click(line2Input);
  await user.paste("Corstorphine");
  await user.click(townInput);
  await user.paste("Edinburgh");
  await user.click(countyInput);
  await user.paste("Midlothian");
  await user.click(postcodeInput);
  await user.paste("EH12 6TS");
  await user.click(countryInput);
  await user.paste("Scotland");

  const file1 = new File(["test1"], "test1.png", { type: "image/png" });
  const file2 = new File(["test2"], "test2.png", { type: "image/png" });
  const input = screen.getByTestId("upload-input");

  const previousUploadCount = mockedUploadPrivateFile.mock.calls.length;

  await user.upload(input, [file1, file2]);

  await waitFor(() => {
    const newUploadCount = mockedUploadPrivateFile.mock.calls.length;
    expect(newUploadCount).toEqual(previousUploadCount + 2);
  });

  const mockFile1 = screen.getByTestId("test1.png");
  const mockFile2 = screen.getByTestId("test2.png");

  expect(mockFile1).toBeVisible();
  expect(mockFile2).toBeVisible();

  const saveButton = screen.getByRole("button", {
    name: /Save/,
  });
  await user.click(saveButton);
};

/**
 * Helper for tests that only care about list structure
 * (add / remove / edit / cancel) rather than specific field types
 *
 * Use with mockSimpleProps (name and email fields, no file upload)
 */
export const fillInSimpleResponse = async (user: UserEvent) => {
  const nameInput = screen.getByLabelText(/What's their name/);
  await user.click(nameInput);
  await user.paste("Richard Parker");

  const emailInput = screen.getByLabelText(/email/);
  await user.click(emailInput);
  await user.paste("richard.parker@pi.com");

  const saveButton = screen.getByRole("button", { name: /Save/ });
  await user.click(saveButton);
};
