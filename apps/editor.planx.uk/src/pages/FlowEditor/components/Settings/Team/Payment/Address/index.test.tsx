import type { User } from "@opensystemslab/planx-core/types";
import { act, screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";

import Address from ".";

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

describe("Address", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    setState({ user: platformAdminUser, teamId: 2, teamSlug: "adur-worthing" });
  });

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("reads and updates a named account's own invoice address", async () => {
    let updateVariables: Record<string, unknown> | undefined;
    server.use(
      graphql.query("GetInvoiceAddressById", ({ variables }) => {
        expect(variables).toEqual({ id: 12 });
        return HttpResponse.json({
          data: {
            teamInvoiceAddress: [
              {
                id: 12,
                addressLine1: "Town Hall",
                addressLine2: "Chapel Rd",
                townCity: "Worthing",
                county: null,
                postcode: "BN11 1HA",
              },
            ],
          },
        });
      }),
      graphql.mutation("UpdateInvoiceAddressById", ({ variables }) => {
        updateVariables = variables;
        return HttpResponse.json({
          data: { update_team_invoice_details: { returning: [] } },
        });
      }),
    );

    const { user } = await setup(
      <Address account={{ name: "Worthing", invoiceDetailsId: 12 }} />,
    );

    expect(
      await screen.findByText("Address information: Worthing"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Address line 1")).toHaveValue("Town Hall");

    await user.type(screen.getByLabelText("County (optional)"), "West Sussex");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Settings updated successfully"),
    ).toBeInTheDocument();
    expect(updateVariables).toEqual({
      id: 12,
      teamInvoiceAddress: expect.objectContaining({
        address_line1: "Town Hall",
        county: "West Sussex",
      }),
    });
  });
});
