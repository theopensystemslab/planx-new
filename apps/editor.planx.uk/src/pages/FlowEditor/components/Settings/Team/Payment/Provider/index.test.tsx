import { act, screen, waitFor, within } from "@testing-library/react";
import { graphql, http, HttpResponse } from "msw";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";

import Provider, { type PaymentProvider } from ".";

const API_URL = import.meta.env.VITE_APP_API_URL;

const { getState, setState } = useStore;
let initialState: FullStore;

const STRIPE_WARNING = /Stripe payments are not yet available/;

const providerHandler = (paymentProvider: PaymentProvider) =>
  graphql.query("GetPaymentProvider", () =>
    HttpResponse.json({ data: { teamSettings: [{ paymentProvider }] } }),
  );

let stripeStatusRequested = false;

const stripeStatusHandler = (connected: boolean, govPayConfigured = false) =>
  http.get(`${API_URL}/stripe/connect/:teamSlug/status`, () => {
    stripeStatusRequested = true;
    return HttpResponse.json({
      connected,
      accountId: connected ? "acct_123" : null,
      mode: "test",
      govPayConfigured,
    });
  });

describe("Provider", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    stripeStatusRequested = false;
    setState({ teamId: 1, teamSlug: "lambeth" });
  });

  afterEach(() => {
    act(() => setState(initialState));
    vi.unstubAllEnvs();
  });

  it("does not show the Stripe warning for a Stripe team", async () => {
    server.use(providerHandler("stripe"), stripeStatusHandler(true));

    await setup(<Provider />);

    expect(await screen.findByText("Stripe")).toBeInTheDocument();
    expect(screen.queryByText(STRIPE_WARNING)).not.toBeInTheDocument();
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
  });

  it("disables the migrate button for a GOV.UK Pay team without a connected Stripe account", async () => {
    server.use(providerHandler("govpay"), stripeStatusHandler(false));

    await setup(<Provider />);

    expect(await screen.findByText("GOV.UK Pay")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Migrate to Stripe" }),
    ).toBeDisabled();
  });

  it("shows the revert button for a Stripe team with GOV.UK Pay configured", async () => {
    server.use(providerHandler("stripe"), stripeStatusHandler(true, true));

    await setup(<Provider />);

    expect(
      await screen.findByRole("button", { name: "Revert to GOV.UK Pay" }),
    ).toBeInTheDocument();
  });

  it("hides the revert button for a Stripe team without GOV.UK Pay configured", async () => {
    server.use(providerHandler("stripe"), stripeStatusHandler(true, false));

    await setup(<Provider />);

    expect(await screen.findByText("Stripe")).toBeInTheDocument();
    await waitFor(() => expect(stripeStatusRequested).toBe(true));
    expect(
      screen.queryByRole("button", { name: "Revert to GOV.UK Pay" }),
    ).not.toBeInTheDocument();
  });

  it("explains a blocked migration when Stripe payments are not yet live", async () => {
    server.use(
      providerHandler("govpay"),
      stripeStatusHandler(true),
      http.post(`${API_URL}/stripe/migrate/:teamSlug`, () =>
        HttpResponse.json(
          {
            canMigrate: false,
            blockers: [{ reason: "stripePaymentsNotEnabled" }],
          },
          { status: 409 },
        ),
      ),
    );

    const { user } = await setup(<Provider />);

    await user.click(
      await screen.findByRole("button", { name: "Migrate to Stripe" }),
    );
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Migrate to Stripe",
      }),
    );

    expect(
      await screen.findByText(/Stripe payments are not yet live on PlanX/),
    ).toBeInTheDocument();
  });

  describe("in production, before Stripe payments go live", () => {
    beforeEach(() => vi.stubEnv("VITE_APP_ENV", "production"));

    it("warns that Stripe payments are not yet available when the team is on Stripe", async () => {
      server.use(providerHandler("stripe"), stripeStatusHandler(true));

      await setup(<Provider />);

      expect(
        await screen.findByRole("region", { name: STRIPE_WARNING }),
      ).toBeInTheDocument();
    });

    it("hides the migrate button, and explains that switching is not yet available", async () => {
      server.use(providerHandler("govpay"), stripeStatusHandler(true));

      await setup(<Provider />);

      expect(
        await screen.findByText(/Switching to Stripe is not yet available/),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Migrate to Stripe" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("in production, for an internal team", () => {
    beforeEach(() => {
      vi.stubEnv("VITE_APP_ENV", "production");
      setState({ teamSlug: "opensystemslab" });
    });

    it("shows the migrate button for a GOV.UK Pay team", async () => {
      server.use(providerHandler("govpay"), stripeStatusHandler(true));

      await setup(<Provider />);

      expect(
        await screen.findByRole("button", { name: "Migrate to Stripe" }),
      ).toBeEnabled();
    });

    it("does not show the Stripe warning or the revert button when the team is on Stripe", async () => {
      server.use(providerHandler("stripe"), stripeStatusHandler(true, true));

      await setup(<Provider />);

      expect(await screen.findByText("Stripe")).toBeInTheDocument();
      expect(screen.queryByText(STRIPE_WARNING)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Revert to GOV.UK Pay" }),
      ).not.toBeInTheDocument();
    });
  });
});
