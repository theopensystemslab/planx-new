import { act, screen, waitFor } from "@testing-library/react";
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

interface MockStatus {
  connected: boolean;
  accountId: string | null;
  mode: "test" | "live";
  canConnect: boolean;
}

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
          mode: "test",
          canConnect: true,
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
        mode: "test",
        canConnect: true,
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

  it("disables connecting a live account until Stripe is enabled on staging", async () => {
    server.use(
      statusHandler({
        connected: false,
        accountId: null,
        mode: "live",
        canConnect: false,
      }),
    );

    await setup(<Onboarding />);

    expect(
      await screen.findByText(
        /only be connected once Stripe is enabled as the payment provider on staging/,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Connect Stripe account" }),
    ).toBeDisabled();
  });

  it("redirects to the API's Stripe connect route when clicking Connect", async () => {
    server.use(
      statusHandler({
        connected: false,
        accountId: null,
        mode: "test",
        canConnect: true,
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
          mode,
          canConnect: true,
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
        mode: "test",
        canConnect: true,
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
        mode: "test",
        canConnect: true,
      }),
    );

    await setup(<Onboarding />);

    expect(await screen.findByText("Connected")).toBeInTheDocument();
    expect(screen.getByText("acct_123")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it("shows a live mode chip when connected in live mode", async () => {
    server.use(
      statusHandler({
        connected: true,
        accountId: "acct_456",
        mode: "live",
        canConnect: true,
      }),
    );

    await setup(<Onboarding />);

    expect(await screen.findByText("Live")).toBeInTheDocument();
  });

  it("shows a success toast and clears the redirect params after a successful connect", async () => {
    server.use(
      statusHandler({
        connected: true,
        accountId: "acct_123",
        mode: "test",
        canConnect: true,
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
        mode: "test",
        canConnect: true,
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
        mode: "test",
        canConnect: true,
      }),
    );

    await setup(<Onboarding />);
    await screen.findByRole("button", { name: "Connect Stripe account" });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
