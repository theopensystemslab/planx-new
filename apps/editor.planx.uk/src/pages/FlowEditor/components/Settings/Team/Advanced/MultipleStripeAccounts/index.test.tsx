import type { User } from "@opensystemslab/planx-core/types";
import { act, screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";

import MultipleStripeAccounts from ".";

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

const settingHandler = ({
  team,
  enabled,
  accounts,
}: {
  team: { id: number; name: string };
  enabled: boolean;
  accounts: string[];
}) =>
  graphql.query("GetMultipleStripeAccountsSetting", () =>
    HttpResponse.json({
      data: {
        teams: [
          {
            ...team,
            settings: { id: 1, multipleStripeAccountsEnabled: enabled },
          },
        ],
        stripeAccounts: accounts.map((name, i) => ({ id: i + 1, name })),
      },
    }),
  );

describe("MultipleStripeAccounts", () => {
  beforeAll(() => (initialState = getState()));

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("can be turned on for a team with a single account", async () => {
    setState({ user: platformAdminUser, teamId: 1, teamSlug: "lambeth" });
    let updateVariables: Record<string, unknown> | undefined;
    server.use(
      settingHandler({
        team: { id: 1, name: "Lambeth" },
        enabled: false,
        accounts: ["Lambeth"],
      }),
      graphql.mutation(
        "UpdateMultipleStripeAccountsSetting",
        ({ variables }) => {
          updateVariables = variables;
          return HttpResponse.json({
            data: { update_team_settings: { returning: [] } },
          });
        },
      ),
    );

    const { user } = await setup(<MultipleStripeAccounts />);

    const toggle = await screen.findByRole("switch", {
      name: "Multiple Stripe accounts",
    });
    expect(toggle).toBeEnabled();

    await user.click(toggle);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Settings updated successfully"),
    ).toBeInTheDocument();
    expect(updateVariables).toEqual({
      teamId: 1,
      settings: { multiple_stripe_accounts_enabled: true },
    });
  });

  it("can't be turned off while the team has accounts not named after it", async () => {
    setState({ user: platformAdminUser, teamId: 2, teamSlug: "adur-worthing" });
    server.use(
      settingHandler({
        team: { id: 2, name: "Adur & Worthing" },
        enabled: true,
        accounts: ["Adur", "Worthing"],
      }),
    );

    await setup(<MultipleStripeAccounts />);

    expect(
      await screen.findByRole("switch", { name: "Multiple Stripe accounts" }),
    ).toBeDisabled();
    expect(
      screen.getByText(
        "This can't be turned off while the team has other Stripe accounts (Adur, Worthing).",
      ),
    ).toBeInTheDocument();
  });

  it("can be turned off while the team only has an account named after it", async () => {
    setState({ user: platformAdminUser, teamId: 2, teamSlug: "adur-worthing" });
    server.use(
      settingHandler({
        team: { id: 2, name: "Adur & Worthing" },
        enabled: true,
        accounts: ["Adur & Worthing"],
      }),
    );

    await setup(<MultipleStripeAccounts />);

    expect(
      await screen.findByRole("switch", { name: "Multiple Stripe accounts" }),
    ).toBeEnabled();
  });
});
