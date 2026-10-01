import { act, screen, waitFor } from "@testing-library/react";
import type { StripeConnectStatus as MockStatus } from "lib/api/stripe/types";
import { http, HttpResponse } from "msw";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";

import { Onboarding } from ".";

const API_URL = import.meta.env.VITE_APP_API_URL;

const { getState, setState } = useStore;
let initialState: FullStore;

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const statusHandler = (status: MockStatus) =>
  http.get(`${API_URL}/stripe/connect/:teamSlug/status`, () =>
    HttpResponse.json(status),
  );

describe("Onboarding", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    setState({ teamSlug: "lambeth" });
    mockNavigate.mockClear();
  });

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("shows a loading indicator while the connection status is being fetched", async () => {
    server.use(
      http.get(`${API_URL}/stripe/connect/:teamSlug/status`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({
          connected: false,
          accountId: null,
          accountStatus: null,
          mode: "test",
        } satisfies MockStatus);
      }),
    );

    await setup(<Onboarding />);

    expect(
      screen.getByText("Checking connection status..."),
    ).toBeInTheDocument();
  });

  it("prompts to connect when no Stripe account is linked", async () => {
    server.use(
      statusHandler({
        connected: false,
        accountId: null,
        accountStatus: null,
        mode: "test",
      }),
    );

    await setup(<Onboarding />);

    expect(
      await screen.findByText(/No Stripe account connected/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connect Stripe account" }),
    ).toBeVisible();
  });

  it("redirects to the API's Stripe connect route when clicking Connect", async () => {
    server.use(
      statusHandler({
        connected: false,
        accountId: null,
        accountStatus: null,
        mode: "test",
      }),
    );
    const { user } = await setup(<Onboarding />);
    const button = await screen.findByRole("button", {
      name: "Connect Stripe account",
    });
    await waitFor(() => expect(button).toBeEnabled());

    // Stub location only once the status has loaded, as the request depends on it
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
      configurable: true,
    });

    await user.click(button);

    expect(window.location.href).toBe(`${API_URL}/stripe/connect/lambeth`);

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it.each([
    { mode: "test", message: "Setting up your test Stripe account..." },
    { mode: "live", message: "Redirecting to Stripe..." },
  ] as const)(
    "shows a loading state in $mode mode while waiting for the redirect to Stripe",
    async ({ mode, message }) => {
      server.use(
        statusHandler({
          connected: false,
          accountId: null,
          accountStatus: null,
          mode,
        }),
      );

      const { user } = await setup(<Onboarding />);
      const connectButton = await screen.findByRole("button", {
        name: "Connect Stripe account",
      });

      // Stub navigation only once the status has loaded
      const originalLocation = window.location;
      Object.defineProperty(window, "location", {
        value: { ...originalLocation, href: "" },
        writable: true,
        configurable: true,
      });

      await user.click(connectButton);

      expect(screen.getByText(message)).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Connect Stripe account" }),
      ).not.toBeInTheDocument();

      Object.defineProperty(window, "location", {
        value: originalLocation,
        writable: true,
        configurable: true,
      });
    },
  );

  it("clears the loading state if the page is restored from the bfcache", async () => {
    server.use(
      statusHandler({
        connected: false,
        accountId: null,
        accountStatus: null,
        mode: "test",
      }),
    );
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
      configurable: true,
    });

    const { user } = await setup(<Onboarding />);

    await user.click(
      await screen.findByRole("button", { name: "Connect Stripe account" }),
    );
    act(() => {
      window.dispatchEvent(
        new PageTransitionEvent("pageshow", { persisted: true }),
      );
    });

    expect(
      screen.getByRole("button", { name: "Connect Stripe account" }),
    ).toBeVisible();

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("shows the connected account and a test mode chip when connected in test mode", async () => {
    server.use(
      statusHandler({
        connected: true,
        accountId: "acct_123",
        accountStatus: "active",
        mode: "test",
      }),
    );

    await setup(<Onboarding />);

    expect(await screen.findByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("acct_123")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("links to the test mode Stripe dashboard in a new tab when connected in test mode", async () => {
    server.use(
      statusHandler({
        connected: true,
        accountId: "acct_123",
        accountStatus: "active",
        mode: "test",
      }),
    );

    await setup(<Onboarding />);

    const link = await screen.findByRole("link", {
      name: /Open Stripe dashboard/,
    });
    expect(link).toHaveAttribute(
      "href",
      "https://dashboard.stripe.com/acct_123/test/dashboard",
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("links to the live Stripe dashboard when connected in live mode", async () => {
    server.use(
      statusHandler({
        connected: true,
        accountId: "acct_456",
        accountStatus: "active",
        mode: "live",
      }),
    );

    await setup(<Onboarding />);

    const link = await screen.findByRole("link", {
      name: /Open Stripe dashboard/,
    });
    expect(link).toHaveAttribute(
      "href",
      "https://dashboard.stripe.com/acct_456/dashboard",
    );
  });

  it("does not link to the Stripe dashboard when not connected", async () => {
    server.use(
      statusHandler({
        connected: false,
        accountId: null,
        accountStatus: null,
        mode: "test",
      }),
    );

    await setup(<Onboarding />);

    await screen.findByText("Connect Stripe account");
    expect(
      screen.queryByRole("link", { name: /Open Stripe dashboard/ }),
    ).not.toBeInTheDocument();
  });

  it("shows a live mode chip when connected in live mode", async () => {
    server.use(
      statusHandler({
        connected: true,
        accountId: "acct_456",
        accountStatus: "active",
        mode: "live",
      }),
    );

    await setup(<Onboarding />);

    expect(await screen.findByText("Live")).toBeInTheDocument();
  });

  it.each([
    {
      accountStatus: "incomplete",
      label: "Setup incomplete",
      description: /Stripe needs more information before it can take payments/,
    },
    {
      accountStatus: "pending",
      label: "Pending verification",
      description: /Stripe is checking the details you provided/,
    },
  ] as const)(
    "shows a $accountStatus account as not yet able to take payments",
    async ({ accountStatus, label, description }) => {
      server.use(
        statusHandler({
          connected: true,
          accountId: "acct_789",
          accountStatus,
          mode: "live",
        }),
      );

      await setup(<Onboarding />);

      expect(await screen.findByText(label)).toBeInTheDocument();
      expect(screen.getByText(description)).toBeInTheDocument();
      expect(screen.queryByText("Connected")).not.toBeInTheDocument();
      expect(screen.getByText("acct_789")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /Stripe dashboard/ }),
      ).toHaveAttribute(
        "href",
        "https://dashboard.stripe.com/acct_789/dashboard",
      );
    },
  );

  it("prompts to finish setup in the Stripe dashboard when the account is incomplete", async () => {
    server.use(
      statusHandler({
        connected: true,
        accountId: "acct_789",
        accountStatus: "incomplete",
        mode: "live",
      }),
    );

    await setup(<Onboarding />);

    expect(
      await screen.findByRole("link", {
        name: /Finish setup in the Stripe dashboard/,
      }),
    ).toBeInTheDocument();
  });

  it("prompts to reconnect, without a dashboard link, when the account is unavailable", async () => {
    server.use(
      statusHandler({
        connected: true,
        accountId: "acct_789",
        accountStatus: "unavailable",
        mode: "live",
      }),
    );

    await setup(<Onboarding />);

    expect(await screen.findByText("Disconnected")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connect Stripe account" }),
    ).toBeVisible();
    expect(
      screen.queryByRole("link", { name: /Stripe dashboard/ }),
    ).not.toBeInTheDocument();
  });

  it("shows a success toast and clears the redirect params after a successful connect", async () => {
    server.use(
      statusHandler({
        connected: true,
        accountId: "acct_123",
        accountStatus: "active",
        mode: "test",
      }),
    );

    await setup(<Onboarding stripeResult={{ type: "success" }} />);

    expect(
      await screen.findByText("Stripe account connected successfully"),
    ).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: ".", replace: true }),
    );
  });

  it("shows the toast message when passed a Stripe error", async () => {
    server.use(
      statusHandler({
        connected: false,
        accountId: null,
        accountStatus: null,
        mode: "test",
      }),
    );

    await setup(
      <Onboarding
        stripeResult={{
          type: "error",
          message: "Stripe connection was cancelled",
        }}
      />,
    );

    expect(
      await screen.findByText("Stripe connection was cancelled"),
    ).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: ".", replace: true }),
    );
  });

  it("does not toast or clear params when there is no Stripe result", async () => {
    server.use(
      statusHandler({
        connected: false,
        accountId: null,
        accountStatus: null,
        mode: "test",
      }),
    );

    await setup(<Onboarding />);
    await screen.findByRole("button", { name: "Connect Stripe account" });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
