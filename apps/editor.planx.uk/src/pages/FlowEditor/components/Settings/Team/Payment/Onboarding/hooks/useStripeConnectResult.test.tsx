import { act, screen } from "@testing-library/react";
import type { StripeConnectResult } from "lib/api/stripe/types";
import { http, HttpResponse } from "msw";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";

import { useStripeConnectResult } from "./useStripeConnectResult";

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

const StripeConnectResult = ({
  stripeResult,
}: {
  stripeResult?: StripeConnectResult;
}) => {
  useStripeConnectResult(stripeResult);
  return <p>Payments</p>;
};

describe("useStripeConnectResult", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    setState({ teamSlug: "lambeth" });
    mockNavigate.mockClear();
    server.use(
      http.get(`${API_URL}/stripe/connect/:teamSlug/status`, () =>
        HttpResponse.json({
          connected: true,
          accountId: "acct_123",
          accountStatus: "active",
          mode: "test",
          govPayConfigured: false,
        }),
      ),
    );
  });

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("shows a success toast and clears the redirect params after a successful connect", async () => {
    await setup(<StripeConnectResult stripeResult={{ type: "success" }} />);

    expect(
      await screen.findByText("Stripe account connected successfully"),
    ).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: ".", replace: true }),
    );
  });

  it("shows the toast message when passed a Stripe error", async () => {
    await setup(
      <StripeConnectResult
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
    await setup(<StripeConnectResult />);
    await screen.findByText("Payments");

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
