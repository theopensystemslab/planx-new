import { act, screen } from "@testing-library/react";
import { graphql, http, HttpResponse } from "msw";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";

import Provider, { type PaymentProvider } from ".";

vi.mock("lib/featureFlags", () => ({
  hasFeatureFlag: (flag: string) => flag === "STRIPE_MIGRATION",
}));

const API_URL = import.meta.env.VITE_APP_API_URL;

const { getState, setState } = useStore;
let initialState: FullStore;

const STRIPE_WARNING = /Stripe payments are not yet available/;
const CONNECT_STRIPE_MESSAGE = /Connect a Stripe account before migrating/;

const providerHandler = (paymentProvider: PaymentProvider) =>
  graphql.query("GetPaymentProvider", () =>
    HttpResponse.json({ data: { teamSettings: [{ paymentProvider }] } }),
  );

const stripeStatusHandler = (connected: boolean) =>
  http.get(`${API_URL}/stripe/connect/:teamSlug/status`, () =>
    HttpResponse.json({
      connected,
      accountId: connected ? "acct_123" : null,
      mode: "test",
    }),
  );

describe("Provider", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => setState({ teamId: 1, teamSlug: "lambeth" }));

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("warns that Stripe payments are not yet available when the team is on Stripe", async () => {
    server.use(providerHandler("stripe"), stripeStatusHandler(true));

    await setup(<Provider />);

    expect(
      await screen.findByRole("region", { name: STRIPE_WARNING }),
    ).toBeInTheDocument();
  });

  it("does not show the Stripe warning for a GOV.UK Pay team", async () => {
    server.use(providerHandler("govpay"), stripeStatusHandler(true));

    await setup(<Provider />);

    expect(await screen.findByText("GOV.UK Pay")).toBeInTheDocument();
    expect(screen.queryByText(STRIPE_WARNING)).not.toBeInTheDocument();
  });

  it("shows the migrate button for a GOV.UK Pay team with a connected Stripe account", async () => {
    server.use(providerHandler("govpay"), stripeStatusHandler(true));

    await setup(<Provider />);

    expect(
      await screen.findByRole("button", { name: "Migrate to Stripe" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(CONNECT_STRIPE_MESSAGE)).not.toBeInTheDocument();
  });

  it("hides the migrate button for a GOV.UK Pay team without a connected Stripe account", async () => {
    server.use(providerHandler("govpay"), stripeStatusHandler(false));

    await setup(<Provider />);

    expect(await screen.findByText(CONNECT_STRIPE_MESSAGE)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Migrate to Stripe" }),
    ).not.toBeInTheDocument();
  });
});
