import { act, screen } from "@testing-library/react";
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
      statusHandler({ connected: false, accountId: null, mode: "test" }),
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
      statusHandler({ connected: false, accountId: null, mode: "test" }),
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

    expect(window.location.href).toBe(`${API_URL}/stripe/connect/lambeth`);

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
      statusHandler({ connected: false, accountId: null, mode: "test" }),
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
      statusHandler({ connected: false, accountId: null, mode: "test" }),
    );

    await setup(<Onboarding />);
    await screen.findByRole("button", { name: "Connect Stripe account" });

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
