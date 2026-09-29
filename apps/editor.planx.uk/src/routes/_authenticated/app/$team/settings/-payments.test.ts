import { getStripeConnectResult } from "./-payments.utils";

describe("getStripeConnectResult", () => {
  it("returns a success result when stripeConnected is true", () => {
    expect(
      getStripeConnectResult({ stripeConnected: true, stripeError: undefined }),
    ).toEqual({ type: "success" });
  });

  it("maps access_denied to a cancellation message", () => {
    expect(
      getStripeConnectResult({
        stripeConnected: undefined,
        stripeError: "access_denied",
      }),
    ).toEqual({ type: "error", message: "Stripe connection was cancelled" });
  });

  it("maps other known error codes to the default failure message", () => {
    for (const stripeError of [
      "invalid_state",
      "missing_code",
      "connect_failed",
    ] as const) {
      expect(
        getStripeConnectResult({ stripeConnected: undefined, stripeError }),
      ).toEqual({
        type: "error",
        message: "Failed to connect Stripe account, please try again",
      });
    }
  });

  it("falls back to the default failure message for an unrecognised error code", () => {
    expect(
      getStripeConnectResult({
        stripeConnected: undefined,
        stripeError: "some_new_stripe_error",
      }),
    ).toEqual({
      type: "error",
      message: "Failed to connect Stripe account, please try again",
    });
  });

  it("returns undefined when there is no redirect result to report", () => {
    expect(
      getStripeConnectResult({
        stripeConnected: undefined,
        stripeError: undefined,
      }),
    ).toBeUndefined();
  });
});
