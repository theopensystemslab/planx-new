import { expect, Page } from "@playwright/test";
import { setupOSMockResponse } from "../mocks/osPlacesResponse";

export async function answerFindProperty(page: Page) {
  await setupOSMockResponse(page);
  await page.getByLabel("Postcode").fill("SW1 1AA");
  await page.getByLabel("Select an address").click();
  await page.getByRole("option").first().click();
}

export const userChallengesPlanningConstraint = async (page: Page) => {
  const thisDoesNotApplyConstraintButton = page.getByRole("button", {
    name: "I don't think this constraint applies to this property",
  });

  await thisDoesNotApplyConstraintButton.click();

  const constraintDoesNotApplyDialog = page.getByRole("heading", {
    name: "I don't think this constraint applies to this property",
  });
  await constraintDoesNotApplyDialog.isVisible();

  const noAddressSuppliedButton = page.getByTestId("entity-checkbox-42103309");
  await noAddressSuppliedButton.click();

  const tellUsWhyText = page.getByRole("textbox");
  await tellUsWhyText.fill("This is the reason why");

  const submitConstraintChallenge = page.getByTestId(
    "override-modal-submit-button",
  );
  await submitConstraintChallenge.click();

  await expect(
    page.getByTestId("error-message-checklist-error-inaccurate-entities"),
  ).toBeHidden();
  await expect(
    page.getByTestId("error-message-input-error-inaccurate-entities"),
  ).toBeHidden();
};
