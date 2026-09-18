import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useSearch } from "@tanstack/react-router";
import { act, screen, waitFor } from "@testing-library/react";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import { http, HttpResponse } from "msw";
import type { FullStore, Store } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";
import type { Breadcrumbs } from "types";
import { ApplicationPath } from "types";
import { vi } from "vitest";

import Pay from "./Pay";

vi.mock("lib/featureFlags", () => ({
  hasFeatureFlag: (flag: string) => flag === "STRIPE_MIGRATION",
}));

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

describe("Pay component with Stripe provider (feature flag on)", () => {
  beforeAll(() => (initialState = getState()));

  afterEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSearch).mockReturnValue({});
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

  it("carries sessionId and email in the return URL for Save & Return", async () => {
    let capturedReturnURL: string | undefined;
    server.use(
      http.post(checkoutSessionUrl, async ({ request }) => {
        const body = (await request.json()) as { returnURL: string };
        capturedReturnURL = body.returnURL;
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
      value: Object.assign(
        new URL("http://localhost/test-team/test-flow?foo=bar"),
        { assign: vi.fn(), replace: vi.fn(), reload: vi.fn() },
      ),
    });

    act(() =>
      setState({
        flow: flowWithFee,
        breadcrumbs: feeBreadcrumbs,
        previewEnvironment: "standalone",
        teamSlug: "test-team",
        sessionId: "session-abc",
        saveToEmail: "applicant@example.com",
        path: ApplicationPath.SaveAndReturn,
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

      await waitFor(() => expect(capturedReturnURL).toBeDefined());
      const params = new URL(capturedReturnURL!).searchParams;
      expect(params.get("sessionId")).toBe("session-abc");
      expect(params.get("email")).toBe("applicant@example.com");
    } finally {
      if (originalLocation)
        Object.defineProperty(window, "location", originalLocation);
    }
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
          data: { "application.fee.reference": "pi_test_123" },
        }),
      );
    });

    it("stays in a confirming state and does not submit while unpaid", async () => {
      vi.mocked(useSearch).mockReturnValue({ stripeSessionId: "cs_test_123" });
      server.use(
        http.get(checkoutStatusUrl, () =>
          HttpResponse.json({ status: "complete", paymentStatus: "unpaid" }),
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
