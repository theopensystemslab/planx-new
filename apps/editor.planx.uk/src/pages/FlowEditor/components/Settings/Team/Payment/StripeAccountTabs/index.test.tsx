import type { User } from "@opensystemslab/planx-core/types";
import { act, screen } from "@testing-library/react";
import type {
  StripeConnectAccount,
  StripeConnectStatus,
} from "lib/api/stripe/types";
import { graphql, http, HttpResponse } from "msw";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";

import { StripeAccountTabs } from ".";

const API_URL = import.meta.env.VITE_APP_API_URL;

const { getState, setState } = useStore;
let initialState: FullStore;

const platformAdminUser: User & { jwt: string } = {
  id: 1,
  firstName: "Editor",
  lastName: "Test",
  isPlatformAdmin: true,
  email: "test@test.com",
  teams: [],
  isAnalyst: false,
  jwt: "x.y.z",
  defaultTeamId: null,
};

const accounts: StripeConnectAccount[] = [
  {
    name: "Adur",
    accountId: "acct_adur",
    accountStatus: "active",
    invoiceDetailsId: 11,
  },
  {
    name: "Worthing",
    accountId: "acct_worthing",
    accountStatus: "active",
    invoiceDetailsId: 12,
  },
];

const handlers = [
  http.get(`${API_URL}/stripe/connect/:teamSlug/status`, () =>
    HttpResponse.json({
      connected: true,
      accountId: null,
      accountStatus: null,
      mode: "live",
      govPayConfigured: false,
      accounts,
    } satisfies StripeConnectStatus),
  ),
  graphql.query("GetInvoiceDetailsById", () =>
    HttpResponse.json({ data: { teamInvoiceDetails: [] } }),
  ),
  graphql.query("GetInvoiceAddressById", () =>
    HttpResponse.json({ data: { teamInvoiceAddress: [] } }),
  ),
];

describe("StripeAccountTabs", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    setState({ user: platformAdminUser, teamId: 2, teamSlug: "adur-worthing" });
    server.use(...handlers);
  });

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("introduces the team's connected accounts", async () => {
    await setup(<StripeAccountTabs accounts={accounts} />);

    expect(
      screen.getByRole("heading", { name: "Connected accounts" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This team has several Stripe accounts/),
    ).toBeInTheDocument();
  });

  it("has a tab for each account, and one to connect another", async () => {
    await setup(<StripeAccountTabs accounts={accounts} />);

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Adur",
      "Worthing",
      "Connect an account",
    ]);
  });

  it("starts on the first account, with its onboarding and invoice sections", async () => {
    await setup(<StripeAccountTabs accounts={accounts} />);

    expect(screen.getByRole("tab", { name: "Adur" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByText("Stripe account: Adur")).toBeInTheDocument();
    expect(
      await screen.findByText("Invoice details: Adur"),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Address information: Adur"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Stripe account: Worthing"),
    ).not.toBeInTheDocument();
  });

  it("shows another account's sections when its tab is chosen", async () => {
    const { user } = await setup(<StripeAccountTabs accounts={accounts} />);

    await user.click(screen.getByRole("tab", { name: "Worthing" }));

    expect(screen.getByText("Stripe account: Worthing")).toBeInTheDocument();
    expect(
      await screen.findByText("Invoice details: Worthing"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Stripe account: Adur")).not.toBeInTheDocument();
  });

  it("connects another account from the last tab", async () => {
    const { user } = await setup(<StripeAccountTabs accounts={accounts} />);

    await user.click(screen.getByRole("tab", { name: "Connect an account" }));

    expect(screen.getByLabelText("Account name")).toBeInTheDocument();
    expect(screen.queryByText("Stripe account: Adur")).not.toBeInTheDocument();
  });

  it("starts on connecting an account when the team has none yet", async () => {
    await setup(<StripeAccountTabs accounts={[]} />);

    expect(
      screen.getByRole("tab", { name: "Connect an account" }),
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("Account name")).toBeInTheDocument();
  });
});
