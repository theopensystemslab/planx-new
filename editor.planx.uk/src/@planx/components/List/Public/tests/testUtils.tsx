import { screen } from "@testing-library/react";
import { UserEvent } from "@testing-library/user-event/dist/types/setup/setup";

/**
 * Helper function to fill out a list item form
 */
export const fillInResponse = async (user: UserEvent) => {
  const nameInput = screen.getByLabelText(/What's their name/);
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

  const line1Input = screen.getByLabelText("Address line 1");
  const line2Input = screen.getByLabelText("Address line 2 (optional)");
  const townInput = screen.getByLabelText("Town");
  const countyInput = screen.getByLabelText("County (optional)");
  const postcodeInput = screen.getByLabelText("Postcode");
  const countryInput = screen.getByLabelText("Country (optional)");
  await user.type(line1Input, "134 Corstorphine Rd");
  await user.type(line2Input, "Corstorphine");
  await user.type(townInput, "Edinburgh");
  await user.type(countyInput, "Midlothian");
  await user.type(postcodeInput, "EH12 6TS");
  await user.type(countryInput, "Scotland");

  const saveButton = screen.getByRole("button", {
    name: /Save/,
  });
  await user.click(saveButton);
};
