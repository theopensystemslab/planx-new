import type { User } from "@opensystemslab/planx-core/types";
import { act, screen } from "@testing-library/react";
import { graphql, HttpResponse } from "msw";
import type { FullStore } from "pages/FlowEditor/lib/store";
import { useStore } from "pages/FlowEditor/lib/store";
import server from "test/mockServer";
import { setup } from "test/utils";

import Details from ".";

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

const invoiceDetails = (
  organisationName: string,
  referenceCode: string | null = null,
) => ({
  teamInvoiceDetails: [
    {
      id: 12,
      organisationName,
      emailAddress: "finance@example.com",
      companyRegistration: null,
      vatNumber: "GB123456789",
      referenceCode,
    },
  ],
});

describe("Details", () => {
  beforeAll(() => (initialState = getState()));

  beforeEach(() => {
    setState({ user: platformAdminUser, teamId: 2, teamSlug: "adur-worthing" });
  });

  afterEach(() => {
    act(() => setState(initialState));
  });

  it("reads and updates the team's own invoice details", async () => {
    let updateVariables: Record<string, unknown> | undefined;
    server.use(
      graphql.query("GetInvoiceDetails", ({ variables }) => {
        expect(variables).toEqual({ teamId: 2 });
        return HttpResponse.json({ data: invoiceDetails("Adur & Worthing") });
      }),
      graphql.mutation("UpdateTeamInvoiceDetails", ({ variables }) => {
        updateVariables = variables;
        return HttpResponse.json({
          data: { update_team_invoice_details: { returning: [] } },
        });
      }),
    );

    const { user } = await setup(<Details />);

    expect(await screen.findByText("Invoice details")).toBeInTheDocument();
    expect(screen.getByLabelText("Organisation name")).toHaveValue(
      "Adur & Worthing",
    );

    await user.type(screen.getByLabelText("VAT number"), "0");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Settings updated successfully"),
    ).toBeInTheDocument();
    expect(updateVariables).toEqual(expect.objectContaining({ teamId: 2 }));
    expect(screen.queryByLabelText("Reference code")).not.toBeInTheDocument();
    expect(updateVariables?.teamInvoiceDetails).not.toHaveProperty(
      "reference_code",
    );
  });

  it("reads and updates a named account's own invoice details", async () => {
    let updateVariables: Record<string, unknown> | undefined;
    server.use(
      graphql.query("GetInvoiceDetailsById", ({ variables }) => {
        expect(variables).toEqual({ id: 12 });
        return HttpResponse.json({
          data: invoiceDetails("Worthing Borough Council", "WOR"),
        });
      }),
      graphql.mutation("UpdateInvoiceDetailsById", ({ variables }) => {
        updateVariables = variables;
        return HttpResponse.json({
          data: { update_team_invoice_details: { returning: [] } },
        });
      }),
    );

    const { user } = await setup(
      <Details account={{ name: "Worthing", invoiceDetailsId: 12 }} />,
    );

    expect(
      await screen.findByText("Invoice details: Worthing"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Organisation name")).toHaveValue(
      "Worthing Borough Council",
    );

    expect(screen.getByLabelText("Reference code")).toHaveValue("WOR");

    await user.type(screen.getByLabelText("VAT number"), "0");
    await user.clear(screen.getByLabelText("Reference code"));
    await user.type(screen.getByLabelText("Reference code"), "wot");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText("Settings updated successfully"),
    ).toBeInTheDocument();
    expect(updateVariables).toEqual({
      id: 12,
      teamInvoiceDetails: expect.objectContaining({
        organisation_name: "Worthing Borough Council",
        vat_number: "GB1234567890",
        reference_code: "WOT",
      }),
    });
  });

  it("requires a reference code for a named account", async () => {
    const updated = vi.fn();
    server.use(
      graphql.query("GetInvoiceDetailsById", () =>
        HttpResponse.json({ data: invoiceDetails("Worthing Borough Council") }),
      ),
      graphql.mutation("UpdateInvoiceDetailsById", () => {
        updated();
        return HttpResponse.json({
          data: { update_team_invoice_details: { returning: [] } },
        });
      }),
    );

    const { user } = await setup(
      <Details account={{ name: "Worthing", invoiceDetailsId: 12 }} />,
    );

    const referenceCode = await screen.findByLabelText("Reference code");
    expect(referenceCode).toHaveValue("");

    await user.type(screen.getByLabelText("VAT number"), "0");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText(/Enter a reference code/),
    ).toBeInTheDocument();

    await user.type(referenceCode, "WORTHING");
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(
      await screen.findByText(
        /Reference code must be between 3 and 5 letters long/,
      ),
    ).toBeInTheDocument();
    expect(updated).not.toHaveBeenCalled();
  });

  it("uses the team's own invoice details for an account named after the team", async () => {
    server.use(
      graphql.query("GetInvoiceDetails", () =>
        HttpResponse.json({ data: invoiceDetails("Adur & Worthing") }),
      ),
    );

    await setup(
      <Details account={{ name: "Adur & Worthing", invoiceDetailsId: null }} />,
    );

    expect(
      await screen.findByText("Invoice details: Adur & Worthing"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Organisation name")).toHaveValue(
      "Adur & Worthing",
    );
  });
});
