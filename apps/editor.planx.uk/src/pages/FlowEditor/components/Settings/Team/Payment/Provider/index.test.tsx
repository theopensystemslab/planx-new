import { act, screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";

import Provider, { type PaymentProvider } from ".";

const { getState, setState } = useStore;
let initialState: FullStore;

const STRIPE_WARNING = /Stripe payments are not yet available/;

const providerHandler = (paymentProvider: PaymentProvider) =>
  graphql.query("GetPaymentProvider", () =>
    HttpResponse.json({ data: { teamSettings: [{ paymentProvider }] } }),
  );

describe("Provider", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => setState({ teamId: 1 }));

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("warns that Stripe payments are not yet available when the team is on Stripe", async () => {
    server.use(providerHandler("stripe"));

    await setup(<Provider />);

    expect(
      await screen.findByRole("region", { name: STRIPE_WARNING }),
    ).toBeInTheDocument();
  });

  it("does not show the Stripe warning for a GOV.UK Pay team", async () => {
    server.use(providerHandler("govpay"));

    await setup(<Provider />);

    expect(await screen.findByText("GOV.UK Pay")).toBeInTheDocument();
    expect(screen.queryByText(STRIPE_WARNING)).not.toBeInTheDocument();
  });
});
