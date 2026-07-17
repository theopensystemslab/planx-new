import { parseConfirmation } from "./model";

describe("parseConfirmation", () => {
  it("uses the team settings reply-to email for default contact information", () => {
    const confirmation = parseConfirmation(undefined, "example@council.gov.uk");

    expect(confirmation.contactInfo).toContain("example@council.gov.uk");
    expect(confirmation.contactInfo).not.toContain("ADD YOUR COUNCIL CONTACT");
  });

  it("falls back to the placeholder when no help email is available", () => {
    const confirmation = parseConfirmation(undefined);

    expect(confirmation.contactInfo).toContain("ADD YOUR COUNCIL CONTACT");
  });
});
