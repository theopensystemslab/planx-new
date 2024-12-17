import { Page } from "@playwright/test";
import { setupOSMockResponse } from "../mocks/osPlacesResponse";

export async function answerFindProperty(page: Page) {
  await setupOSMockResponse(page);
  await page.getByLabel("Postcode").fill("SW1 1AA");
  await page.getByLabel("Select an address").click();
  await page.getByRole("option").first().click();
}

export const userChallengesPlanningConstraint = async (page: Page) => {
  const thisDoesNotApplyConstraintButton = page.getByRole("button", {
    name: "I don't think this constraint",
  });

  await thisDoesNotApplyConstraintButton.click();

  const constraintDoesNotApplyDialog = page.getByRole("heading", {
    name: "I don't think this constraint",
  });
  constraintDoesNotApplyDialog.isVisible();

  const noAddressSuppliedButton = page.getByTestId("42103309");
  noAddressSuppliedButton.click();

  const tellUsWhyText = page.getByRole("textbox");
  await tellUsWhyText.fill("This is the reason why");

  const submitConstraintChallenge = page.getByTestId(
    "override-modal-submit-button",
  );
  submitConstraintChallenge.click();
};
