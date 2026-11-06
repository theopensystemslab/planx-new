import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useMatches, useSearch } from "@tanstack/react-router";
import { act, screen, waitFor } from "@testing-library/react";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import { graphql, http, HttpResponse } from "msw";
import type { FullStore, Store } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";
import type { Breadcrumbs } from "types";
import { vi } from "vitest";

import Pay from "./Pay";

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useRouteContext: vi.fn(() => ({ isContentPage: false })),
    useNavigate: vi.fn(() => vi.fn()),
    useParams: vi.fn(() => ({ team: "test-team", flow: "test-flow" })),
    useLocation: vi.fn(() => ({
      pathname: "/test-team/test-flow/pay",
      search: "",
      hash: "",
      state: {},
    })),
    useMatches: vi.fn(() => [{ routeId: "_customDomain/$flow" }]),
    useSearch: vi.fn(() => ({})),
  };
});

const { getState, setState } = useStore;

let initialState: FullStore;

const checkoutSessionUrl = `${
  import.meta.env.VITE_APP_API_URL
}/stripe/checkout-session/:localAuthority`;

const checkoutStatusUrl = `${
  import.meta.env.VITE_APP_API_URL
}/stripe/checkout-session/:localAuthority/:checkoutSessionId`;

const flowWithFee: Store.Flow = {
  _root: { edges: ["setValue", "pay"] },
  setValue: {
    type: TYPES.SetValue,
    edges: ["pay"],
    data: { fn: "application.fee.payable", val: "103" },
  },
  pay: {
    type: TYPES.Pay,
    data: { fn: "application.fee.payable" },
  },
};

const feeBreadcrumbs: Breadcrumbs = {
  setValue: {
    auto: true,
    data: { "application.fee.payable": ["103"] },
  },
};

describe("Pay component with Stripe provider (team on Stripe)", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    server.use(
      graphql.query("GetPaymentProvider", () =>
        HttpResponse.json({
          data: { teamSettings: [{ paymentProvider: "stripe" }] },
        }),
      ),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSearch).mockReturnValue({});
    vi.mocked(useMatches).mockReturnValue([
      { routeId: "_customDomain/$flow" },
    ] as never);
    act(() => setState(initialState));
  });

  it("auto-succeeds in Editor preview mode (side panel)", async () => {
    const handleSubmit = vi.fn();

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "editor",
      }),
    );

    const { user } = await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    await user.click(await screen.findByText("Pay now"));

    // Editor preview has no real payment, so it just advances the flow with no
    // payment reference
    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
  });

  it("redirects to hosted Checkout in standalone (Public) mode", async () => {
    const stripeUrl = "https://checkout.stripe.com/c/pay/cs_test_123";
    server.use(
      http.post(checkoutSessionUrl, () =>
        HttpResponse.json({ url: stripeUrl }),
      ),
    );

    const assignMock = vi.fn();
    const originalLocation = Object.getOwnPropertyDescriptor(
      window,
      "location",
    );
    const mockLocation = Object.assign(
      new URL("http://localhost/test-team/test-flow"),
      { assign: assignMock, replace: vi.fn(), reload: vi.fn() },
    );
    Object.defineProperty(window, "location", {
      configurable: true,
      value: mockLocation,
    });

    const handleSubmit = vi.fn();

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
        teamSlug: "test-team",
      }),
    );

    try {
      const { user } = await setup(
        <AppErrorBoundary>
          <Pay
            title="Pay"
            fn="application.fee.payable"
            handleSubmit={handleSubmit}
            govPayMetadata={[]}
          />
        </AppErrorBoundary>,
      );

      await user.click(await screen.findByText("Pay now"));

      await waitFor(() => expect(assignMock).toHaveBeenCalledWith(stripeUrl));
      expect(handleSubmit).not.toHaveBeenCalled();
    } finally {
      if (originalLocation)
        Object.defineProperty(window, "location", originalLocation);
    }
  });

  it("never sends a return URL to the API", async () => {
    let capturedBody: Record<string, unknown> | undefined;
    server.use(
      http.post(checkoutSessionUrl, async ({ request }) => {
        capturedBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          url: "https://checkout.stripe.com/c/pay/cs_test_123",
        });
      }),
    );

    const originalLocation = Object.getOwnPropertyDescriptor(
      window,
      "location",
    );
    Object.defineProperty(window, "location", {
      configurable: true,
      value: Object.assign(new URL("http://localhost/test-team/test-flow"), {
        assign: vi.fn(),
        replace: vi.fn(),
        reload: vi.fn(),
      }),
    });

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
        teamSlug: "test-team",
      }),
    );

    try {
      const { user } = await setup(
        <AppErrorBoundary>
          <Pay
            title="Pay"
            fn="application.fee.payable"
            handleSubmit={vi.fn()}
            govPayMetadata={[]}
          />
        </AppErrorBoundary>,
      );

      await user.click(await screen.findByText("Pay now"));

      await waitFor(() => expect(capturedBody).toBeDefined());
      expect(capturedBody).not.toHaveProperty("returnURL");
    } finally {
      if (originalLocation)
        Object.defineProperty(window, "location", originalLocation);
    }
  });

  it.each([
    "Stripe payments are not yet enabled",
    "Stripe payments are not enabled for this local authority (test-team)",
    "This local authority (test-team) has not connected a Stripe account",
    "The Stripe account for this local authority (test-team) is not connected or cannot take payments",
  ])(
    "displays an error if the team isn't set up for Stripe: %s",
    async (error) => {
      server.use(
        http.post(checkoutSessionUrl, () =>
          HttpResponse.json({ error }, { status: 409 }),
        ),
      );

      const handleSubmit = vi.fn();

      act(() =>
        setState({
          flow: flowWithFee,
          breadcrumbs: feeBreadcrumbs,
          previewEnvironment: "standalone",
          teamSlug: "test-team",
        }),
      );

      const { user } = await setup(
        <AppErrorBoundary>
          <Pay
            title="Pay"
            fn="application.fee.payable"
            handleSubmit={handleSubmit}
            govPayMetadata={[]}
          />
        </AppErrorBoundary>,
      );

      await user.click(await screen.findByText("Pay now"));

      expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Online payments are not enabled for this local authority",
        ),
      ).toBeInTheDocument();
      expect(handleSubmit).not.toHaveBeenCalled();

      // Matches GOV.UK Pay - applicant can skip payment and continue
      await user.click(screen.getByText("Continue"));
      expect(handleSubmit).toHaveBeenCalled();
    },
  );

  it("tells the applicant the fee cannot be paid online when the council cannot take a payment method for it", async () => {
    server.use(
      http.post(checkoutSessionUrl, () =>
        HttpResponse.json(
          {
            error:
              "Failed to create Stripe Checkout Session for test-team. Reason: The Stripe account for this local authority cannot take a payment method for a total of £748.00, this error has been logged",
          },
          { status: 409 },
        ),
      ),
    );

    const handleSubmit = vi.fn();

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
        teamSlug: "test-team",
      }),
    );

    const { user } = await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          allowInviteToPay={true}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    await user.click(await screen.findByText("Pay now"));

    expect(
      await screen.findByText("This fee cannot be paid online"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Contact your local planning authority to arrange payment.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();

    // A nominee would be refused too, and the applicant cannot skip payment
    expect(
      screen.queryByText("Invite someone else to pay"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Continue")).not.toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it("does not let the applicant skip payment on a locked session", async () => {
    server.use(
      http.post(checkoutSessionUrl, () =>
        HttpResponse.json(
          {
            error: "Cannot initialise a new payment for locked session 123-abc",
          },
          { status: 409 },
        ),
      ),
    );

    const handleSubmit = vi.fn();

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
        teamSlug: "test-team",
      }),
    );

    const { user } = await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    await user.click(await screen.findByText("Pay now"));

    // Matches GOV.UK Pay - an invite to pay has been sent, so the applicant cannot pay or continue
    expect(
      await screen.findByText(
        /Cannot initialise a new payment for locked session/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Online payments are not enabled for this local authority",
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Continue")).not.toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it.each([
    ["a non-Stripe domain", "https://evil.example.com/c/pay/cs_test_123"],
    ["a lookalike domain", "https://checkout.stripe.com.evil.com/c/pay"],
    ["http", "http://checkout.stripe.com/c/pay/cs_test_123"],
  ])(
    "does not redirect to a Checkout URL on %s",
    async (_label, checkoutUrl) => {
      server.use(
        http.post(checkoutSessionUrl, () =>
          HttpResponse.json({ url: checkoutUrl }),
        ),
      );

      const assignMock = vi.fn();
      const originalLocation = Object.getOwnPropertyDescriptor(
        window,
        "location",
      );
      Object.defineProperty(window, "location", {
        configurable: true,
        value: Object.assign(new URL("http://localhost/test-team/test-flow"), {
          assign: assignMock,
          replace: vi.fn(),
          reload: vi.fn(),
        }),
      });

      act(() =>
        setState({
          flow: flowWithFee,
          breadcrumbs: feeBreadcrumbs,
          previewEnvironment: "standalone",
          teamSlug: "test-team",
        }),
      );

      try {
        const { user } = await setup(
          <AppErrorBoundary>
            <Pay
              title="Pay"
              fn="application.fee.payable"
              handleSubmit={vi.fn()}
              govPayMetadata={[]}
            />
          </AppErrorBoundary>,
        );

        await user.click(await screen.findByText("Pay now"));

        expect(
          await screen.findByText("Something went wrong"),
        ).toBeInTheDocument();
        expect(assignMock).not.toHaveBeenCalled();
      } finally {
        if (originalLocation)
          Object.defineProperty(window, "location", originalLocation);
      }
    },
  );

  it.each([
    "/_public/_planXDomain/$team/$flow/draft",
    "/_public/_planXDomain/$team/$flow/preview",
  ])(
    "does not create a Checkout Session on a test link (%s)",
    async (routeId) => {
      vi.mocked(useMatches).mockReturnValue([{ routeId }] as never);

      const createCheckoutSession = vi.fn(() =>
        HttpResponse.json({ url: "https://checkout.stripe.com/c/pay/cs_test" }),
      );
      server.use(http.post(checkoutSessionUrl, createCheckoutSession));

      const handleSubmit = vi.fn();

      act(() =>
        setState({
          flow: flowWithFee,
          breadcrumbs: feeBreadcrumbs,
          previewEnvironment: "standalone",
          teamSlug: "test-team",
        }),
      );

      const { user } = await setup(
        <AppErrorBoundary>
          <Pay
            title="Pay"
            fn="application.fee.payable"
            handleSubmit={handleSubmit}
            govPayMetadata={[]}
          />
        </AppErrorBoundary>,
      );

      await user.click(await screen.findByText("Pay now"));

      expect(
        await screen.findByText(
          "Click continue to skip payment and continue testing.",
        ),
      ).toBeInTheDocument();
      expect(createCheckoutSession).not.toHaveBeenCalled();

      // Testers can skip payment and carry on through the flow
      await user.click(screen.getByText("Continue"));
      expect(handleSubmit).toHaveBeenCalled();
    },
  );

  it("shows the generic error boundary for other Checkout Session errors", async () => {
    server.use(
      http.post(checkoutSessionUrl, () =>
        HttpResponse.json({ error: "Stripe is unavailable" }, { status: 500 }),
      ),
    );

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
        teamSlug: "test-team",
      }),
    );

    const { user } = await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={vi.fn()}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    await user.click(await screen.findByText("Pay now"));

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.queryByText(
        "Online payments are not enabled for this local authority",
      ),
    ).not.toBeInTheDocument();
  });

  it("auto-succeeds in standalone (Public) when hidePay is true", async () => {
    const handleSubmit = vi.fn();

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
      }),
    );

    const { user } = await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          hidePay={true}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    await user.click(await screen.findByText("Continue"));

    await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
  });

  it("has no existing payment (always shows fresh payment flow)", async () => {
    const handleSubmit = vi.fn();

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
      }),
    );

    await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={handleSubmit}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    expect(await screen.findByText("Pay now")).toBeInTheDocument();
    expect(screen.queryByText("Retry payment")).not.toBeInTheDocument();
  });

  it("shows the invite to pay link", async () => {
    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
        teamSlug: "test-team",
      }),
    );

    await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={vi.fn()}
          allowInviteToPay={true}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    expect(await screen.findByText("Pay now")).toBeInTheDocument();
    expect(screen.getByText("Invite someone else to pay")).toBeEnabled();
  });

  it("keeps the invite to pay link enabled after a cancelled Checkout", async () => {
    vi.mocked(useSearch).mockReturnValue({ cancelled: true });

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
        teamSlug: "test-team",
      }),
    );

    await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={vi.fn()}
          allowInviteToPay={true}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    expect(await screen.findByText("Pay now")).toBeInTheDocument();
    expect(screen.getByText("Invite someone else to pay")).toBeEnabled();
  });

  // Open checkout sessions are expired by the API when a new session is set up
  it("keeps the invite to pay link enabled after an unpaid Checkout", async () => {
    vi.mocked(useSearch).mockReturnValue({ stripeSessionId: "cs_test_123" });
    server.use(
      http.get(checkoutStatusUrl, () =>
        HttpResponse.json({ status: "expired", paymentStatus: "unpaid" }),
      ),
    );

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
        teamSlug: "test-team",
      }),
    );

    await setup(
      <AppErrorBoundary>
        <Pay
          title="Pay"
          fn="application.fee.payable"
          handleSubmit={vi.fn()}
          allowInviteToPay={true}
          govPayMetadata={[]}
        />
      </AppErrorBoundary>,
    );

    expect(await screen.findByText("Pay now")).toBeInTheDocument();
    expect(screen.getByText("Invite someone else to pay")).toBeEnabled();
  });

  describe("return from hosted Checkout", () => {
    it("confirms with Stripe and submits when the payment is paid", async () => {
      vi.mocked(useSearch).mockReturnValue({ stripeSessionId: "cs_test_123" });
      server.use(
        http.get(checkoutStatusUrl, () =>
          HttpResponse.json({
            status: "complete",
            paymentStatus: "paid",
            paymentIntentId: "pi_test_123",
          }),
        ),
      );

      const handleSubmit = vi.fn();

      act(() =>
        setState({
          flow: flowWithFee,
          breadcrumbs: feeBreadcrumbs,
          previewEnvironment: "standalone",
          teamSlug: "test-team",
        }),
      );

      await setup(
        <AppErrorBoundary>
          <Pay
            title="Pay"
            fn="application.fee.payable"
            handleSubmit={handleSubmit}
            govPayMetadata={[]}
          />
        </AppErrorBoundary>,
      );

      // Submits with the PaymentIntent id (not the Checkout Session id) as the
      // payment reference
      await waitFor(() => expect(handleSubmit).toHaveBeenCalled());
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { "application.fee.reference.stripe": "pi_test_123" },
        }),
      );
    });

    it("submits and marks the payment as processing when the bank takes it later", async () => {
      vi.mocked(useSearch).mockReturnValue({ stripeSessionId: "cs_test_123" });
      // Bacs Direct Debit - the mandate is agreed, but the payment is not taken yet
      server.use(
        http.get(checkoutStatusUrl, () =>
          HttpResponse.json({
            status: "complete",
            paymentStatus: "unpaid",
            paymentIntentId: "pi_test_123",
          }),
        ),
      );

      const handleSubmit = vi.fn();

      act(() =>
        setState({
          flow: flowWithFee,
          breadcrumbs: feeBreadcrumbs,
          previewEnvironment: "standalone",
          teamSlug: "test-team",
        }),
      );

      await setup(
        <AppErrorBoundary>
          <Pay
            title="Pay"
            fn="application.fee.payable"
            handleSubmit={handleSubmit}
            govPayMetadata={[]}
          />
        </AppErrorBoundary>,
      );

      await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1));
      expect(handleSubmit).toHaveBeenCalledWith({
        data: {
          "application.fee.reference.stripe": "pi_test_123",
          _paymentProcessing: true,
        },
      });
    });

    it("stays in a confirming state and does not submit while Checkout is open", async () => {
      vi.mocked(useSearch).mockReturnValue({ stripeSessionId: "cs_test_123" });
      server.use(
        http.get(checkoutStatusUrl, () =>
          HttpResponse.json({ status: "open", paymentStatus: "unpaid" }),
        ),
      );

      const handleSubmit = vi.fn();

      act(() =>
        setState({
          flow: flowWithFee,
          breadcrumbs: feeBreadcrumbs,
          previewEnvironment: "standalone",
          teamSlug: "test-team",
        }),
      );

      await setup(
        <AppErrorBoundary>
          <Pay
            title="Pay"
            fn="application.fee.payable"
            handleSubmit={handleSubmit}
            govPayMetadata={[]}
          />
        </AppErrorBoundary>,
      );

      expect(
        await screen.findByText("Confirming your payment"),
      ).toBeInTheDocument();
      expect(handleSubmit).not.toHaveBeenCalled();
    });

    it("lets the applicant retry after cancelling", async () => {
      vi.mocked(useSearch).mockReturnValue({ cancelled: true });

      const handleSubmit = vi.fn();

      act(() =>
        setState({
          flow: flowWithFee,
          breadcrumbs: feeBreadcrumbs,
          previewEnvironment: "standalone",
        }),
      );

      await setup(
        <AppErrorBoundary>
          <Pay
            title="Pay"
            fn="application.fee.payable"
            handleSubmit={handleSubmit}
            govPayMetadata={[]}
          />
        </AppErrorBoundary>,
      );

      expect(await screen.findByText("Pay now")).toBeInTheDocument();
      expect(
        screen.getByText(/your payment wasn't completed/i),
      ).toBeInTheDocument();
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });
});
