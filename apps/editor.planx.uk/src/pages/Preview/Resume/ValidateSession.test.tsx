import { screen } from "@testing-library/react";
import { setup } from "test/utils";
import { vi } from "vitest";

import { LockedSession } from "./ValidateSession";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useMatches: vi.fn(() => [{ routeId: "/_public/_customDomain/$flow" }]),
  };
});

describe("LockedSession", () => {
  it("explains a delayed payment (e.g. Bacs) is processing when there's no payment request", async () => {
    await setup(<LockedSession paymentRequest={null} />);

    expect(
      screen.getByText("Sorry, you can't make changes to this form"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/because your payment is being processed/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/you've invited/)).not.toBeInTheDocument();
  });
});
