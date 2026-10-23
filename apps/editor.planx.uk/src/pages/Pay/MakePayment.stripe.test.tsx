import { PaymentStatus } from "@opensystemslab/planx-core/types";
import { screen, waitFor } from "@testing-library/react";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import { graphql, http, HttpResponse } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";
import type { PublicPaymentRequest } from "utils/routeUtils/payQueries";
import { vi } from "vitest";

import MakePayment from "./MakePayment";

const mockPaymentRequest: PublicPaymentRequest = {
  id: "9e13f784-7299-4414-92ff-803bcacdfba8",
  paymentAmount: 12300,
  sessionPreviewData: {
    _address: { title: "123, Test Street, Testville" },
    "proposal.projectType": ["alter.internal"],
  },
  createdAt: "2026-10-01T12:00:00.000Z",
  paidAt: null,
  govPayPaymentId: null,
  stripePaymentId: null,
};

const checkoutSessionUrl = `${
  import.meta.env.VITE_APP_API_URL
}/stripe/payment-request/:paymentRequestId/checkout-session`;

const fulfilUrl = `${
  import.meta.env.VITE_APP_API_URL
}/stripe/payment-request/:paymentRequestId/fulfil`;

const stripeUrl = "https://checkout.stripe.com/c/pay/cs_test_123";

const mockPaymentProvider = (paymentProvider: "govpay" | "stripe") =>
  graphql.query("GetPaymentProvider", () =>
    HttpResponse.json({ data: { teamSettings: [{ paymentProvider }] } }),
  );

const mockWindowLocation = () => {
  const assign = vi.fn();
  const originalLocation = Object.getOwnPropertyDescriptor(window, "location");
  Object.defineProperty(window, "location", {
    configurable: true,
    value: Object.assign(new URL("http://localhost/test-team/test-flow/pay"), {
      assign,
      replace: vi.fn(),
      reload: vi.fn(),
    }),
  });

  return {
    assign,
    restore: () =>
      originalLocation &&
      Object.defineProperty(window, "location", originalLocation),
  };
};

describe("MakePayment with Stripe", () => {
  let location: ReturnType<typeof mockWindowLocation>;

  beforeEach(() => {
    server.use(mockPaymentProvider("stripe"));
    location = mockWindowLocation();
  });

  afterEach(() => {
    location.restore();
  });

  it("redirects to hosted Checkout", async () => {
    server.use(
      http.post(checkoutSessionUrl, () =>
        HttpResponse.json({ url: stripeUrl }),
      ),
    );

    const { user } = await setup(<MakePayment {...mockPaymentRequest} />);

    await user.click(await screen.findByRole("button", { name: "Pay now" }));

    await waitFor(() =>
      expect(location.assign).toHaveBeenCalledWith(stripeUrl),
    );
  });

  it("only creates one Checkout Session on a double click", async () => {
    const createCheckoutSession = vi.fn(() =>
      HttpResponse.json({ url: stripeUrl }),
    );
    server.use(http.post(checkoutSessionUrl, createCheckoutSession));

    const { user } = await setup(<MakePayment {...mockPaymentRequest} />);

    await user.dblClick(await screen.findByRole("button", { name: "Pay now" }));

    await waitFor(() =>
      expect(location.assign).toHaveBeenCalledWith(stripeUrl),
    );
    expect(createCheckoutSession).toHaveBeenCalledTimes(1);
  });

  it("does not redirect away from hosted Checkout", async () => {
    server.use(
      http.post(checkoutSessionUrl, () =>
        HttpResponse.json({ url: "https://example.com/phishing" }),
      ),
    );

    const { user } = await setup(
      <AppErrorBoundary disableReporting>
        <MakePayment {...mockPaymentRequest} />
      </AppErrorBoundary>,
    );

    await user.click(await screen.findByRole("button", { name: "Pay now" }));

    expect(await screen.findByText(/something went wrong/i)).toBeVisible();
    expect(location.assign).not.toHaveBeenCalled();
  });

  it("tells the payer the fee cannot be paid online when the council cannot take a payment method for it", async () => {
    server.use(
      http.post(checkoutSessionUrl, () =>
        HttpResponse.json(
          {
            error:
              "Failed to create Stripe Checkout Session for payment request 123. Reason: The Stripe account for this local authority cannot take a payment method for a total of £748.00, this error has been logged",
          },
          { status: 409 },
        ),
      ),
    );

    const { user } = await setup(
      <AppErrorBoundary disableReporting>
        <MakePayment {...mockPaymentRequest} />
      </AppErrorBoundary>,
    );

    await user.click(await screen.findByRole("button", { name: "Pay now" }));

    expect(
      await screen.findByText("This fee cannot be paid online"),
    ).toBeVisible();
    expect(
      screen.getByText(
        "Contact your local planning authority to arrange payment.",
      ),
    ).toBeVisible();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Pay now" }),
    ).not.toBeInTheDocument();
    expect(location.assign).not.toHaveBeenCalled();
  });

  it("shows the error boundary for other Checkout Session errors", async () => {
    server.use(
      http.post(checkoutSessionUrl, () =>
        HttpResponse.json(
          { error: "Payment request 123 has already been paid" },
          { status: 409 },
        ),
      ),
    );

    const { user } = await setup(
      <AppErrorBoundary disableReporting>
        <MakePayment {...mockPaymentRequest} />
      </AppErrorBoundary>,
    );

    await user.click(await screen.findByRole("button", { name: "Pay now" }));

    expect(await screen.findByText(/something went wrong/i)).toBeVisible();
  });

  describe("on return from hosted Checkout", () => {
    it("confirms the payment, and shows its payment reference", async () => {
      let body: unknown;
      server.use(
        http.post(fulfilUrl, async ({ request }) => {
          body = await request.json();
          return HttpResponse.json({
            paymentStatus: "paid",
            paymentIntentId: "pi_test_123",
          });
        }),
      );

      await setup(
        <MakePayment {...mockPaymentRequest} stripeSessionId="cs_test_123" />,
      );

      expect(await screen.findByText("Payment received")).toBeVisible();
      expect(screen.getByText("Payment reference")).toBeVisible();
      expect(screen.getByText("pi_test_123")).toBeVisible();
      expect(screen.queryByText("Valid until")).not.toBeInTheDocument();
      expect(body).toEqual({ checkoutSessionId: "cs_test_123" });
    });

    it.each([400, 404, 409])(
      "lets the payer try again if Checkout was not completed (%i)",
      async (status) => {
        server.use(
          http.post(fulfilUrl, () =>
            HttpResponse.json({ error: "Not paid" }, { status }),
          ),
        );

        await setup(
          <MakePayment {...mockPaymentRequest} stripeSessionId="cs_test_123" />,
        );

        expect(
          await screen.findByRole("button", { name: "Pay now" }),
        ).toBeVisible();
        expect(
          screen.getByText(/your payment wasn't completed/i),
        ).toBeVisible();
        expect(screen.queryByText("Payment received")).not.toBeInTheDocument();
      },
    );

    it("lets the payer check again if the payment could not be confirmed", async () => {
      server.use(
        http.post(
          fulfilUrl,
          () => HttpResponse.json({ error: "Stripe error" }, { status: 500 }),
          { once: true },
        ),
        http.post(fulfilUrl, () =>
          HttpResponse.json({
            paymentStatus: "paid",
            paymentIntentId: "pi_test_123",
          }),
        ),
      );

      const { user } = await setup(
        <MakePayment {...mockPaymentRequest} stripeSessionId="cs_test_123" />,
      );

      await user.click(
        await screen.findByRole("button", { name: "Check payment status" }),
      );

      expect(await screen.findByText("Payment received")).toBeVisible();
    });

    it("lets the payer check again if the API is rate limited", async () => {
      server.use(
        http.post(fulfilUrl, () =>
          HttpResponse.json({ error: "Too many requests" }, { status: 429 }),
        ),
      );

      await setup(
        <MakePayment {...mockPaymentRequest} stripeSessionId="cs_test_123" />,
      );

      expect(
        await screen.findByRole("button", { name: "Check payment status" }),
      ).toBeVisible();
      expect(
        screen.queryByRole("button", { name: "Pay now" }),
      ).not.toBeInTheDocument();
    });

    it("lets the payer try again after cancelling", async () => {
      const fulfil = vi.fn();
      server.use(http.post(fulfilUrl, fulfil));

      await setup(<MakePayment {...mockPaymentRequest} cancelled={true} />);

      expect(
        await screen.findByRole("button", { name: "Pay now" }),
      ).toBeVisible();
      expect(screen.getByText(/your payment wasn't completed/i)).toBeVisible();
      expect(fulfil).not.toHaveBeenCalled();
    });
  });

  it("stays on GOV.UK Pay once a GOV.UK payment has been started", async () => {
    const createCheckoutSession = vi.fn();
    const getPaymentProvider = vi.fn();
    server.use(
      graphql.query("GetPaymentProvider", getPaymentProvider),
      http.post(checkoutSessionUrl, createCheckoutSession),
      http.get("*/payment-request/:paymentRequestId/payment/:paymentId", () =>
        HttpResponse.json({
          payment_id: "govpay-ref-123",
          state: { status: PaymentStatus.created, finished: false },
          _links: { next_url: { href: "https://www.example.com" } },
        }),
      ),
    );

    const { user } = await setup(
      <MakePayment {...mockPaymentRequest} govPayPaymentId="govpay-ref-123" />,
    );

    await user.click(
      await screen.findByRole("button", { name: "Retry payment" }),
    );

    expect(createCheckoutSession).not.toHaveBeenCalled();
    expect(getPaymentProvider).not.toHaveBeenCalled();
  });

  it("uses GOV.UK Pay for a team which is not on Stripe", async () => {
    server.use(mockPaymentProvider("govpay"));

    const createCheckoutSession = vi.fn();
    const createGovPayPayment = vi.fn(() =>
      HttpResponse.json({
        payment_id: "govpay-ref-123",
        state: { status: PaymentStatus.created, finished: false },
        _links: { next_url: { href: "https://www.example.com" } },
      }),
    );
    server.use(
      http.post(checkoutSessionUrl, createCheckoutSession),
      http.post("*/payment-request/:paymentRequestId/pay", createGovPayPayment),
    );

    const { user } = await setup(<MakePayment {...mockPaymentRequest} />);

    await user.click(await screen.findByRole("button", { name: "Pay now" }));

    await waitFor(() => expect(createGovPayPayment).toHaveBeenCalledTimes(1));
    expect(createCheckoutSession).not.toHaveBeenCalled();
  });

  it("shows an error if the team's payment provider can't be loaded", async () => {
    server.use(
      graphql.query("GetPaymentProvider", () =>
        HttpResponse.json({ errors: [{ message: "Hasura error" }] }),
      ),
    );

    await setup(
      <AppErrorBoundary disableReporting>
        <MakePayment {...mockPaymentRequest} />
      </AppErrorBoundary>,
    );

    expect(await screen.findByText(/something went wrong/i)).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Pay now" }),
    ).not.toBeInTheDocument();
  });
});
