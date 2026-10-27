import { gqlWithRole, introspectAs } from "./utils.js";

const queryStripeAccountLink = `
  query {
    team_invoice_details {
      team_stripe_account_id
    }
  }
`;

describe("team_invoice_details", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query team_invoice_details", () => {
      expect(i.queries).not.toContain("team_invoice_details");
    });

    test("cannot create, update, or delete team_invoice_details", () => {
      expect(i).toHaveNoMutationsFor("team_invoice_details");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query team_invoice_details", () => {
      expect(i.queries).toContain("team_invoice_details");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query team_invoice_details", () => {
      expect(i.queries).toContain("team_invoice_details");
    });

    test("can see which Stripe account invoice details belong to", async () => {
      const res = await gqlWithRole("platformAdmin")(queryStripeAccountLink);
      expect(res).not.toHaveProperty("errors");
    });

    test("cannot query insert team_invoice_details", () => {
      expect(i.queries).not.toContain("insert_team_invoice_details");
    });

    test("can mutate team_invoice_details", async () => {
      expect(i.mutations).toContain("update_team_invoice_details");
      expect(i.mutations).toContain("update_team_invoice_details_by_pk");
    });

    test("cannot delete team_invoice_details", async () => {
      expect(i.mutations).not.toContain("delete_team_invoice_details");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query team_invoice_details", () => {
      expect(i.queries).toContain("team_invoice_details");
    });

    test("cannot see which Stripe account invoice details belong to", async () => {
      const res = await gqlWithRole("teamEditor")(queryStripeAccountLink);
      expect(res).toHaveProperty("errors");
    });

    test("can update team_invoice_details", () => {
      expect(i.mutations).toContain("update_team_invoice_details");
      expect(i.mutations).toContain("update_team_invoice_details_by_pk");
    });

    test("cannot delete team_invoice_details", async () => {
      expect(i.mutations).not.toContain("delete_team_invoice_details");
    });

    test("cannot insert team_invoice_details", async () => {
      expect(i.mutations).not.toContain("insert_team_invoice_details");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query team_invoice_details", () => {
      expect(i.queries).not.toContain("team_invoice_details");
    });

    test("cannot update team_invoice_details", () => {
      expect(i.mutations).not.toContain("update_team_invoice_details");
      expect(i.mutations).not.toContain("update_team_invoice_details_by_pk");
    });

    test("cannot delete or insert team_invoice_details", () => {
      expect(i.mutations).not.toContain("delete_team_invoice_details");
      expect(i.mutations).not.toContain("insert_team_invoice_details");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query team_invoice_details", () => {
      expect(i.queries).toContain("team_invoice_details");
    });

    test("can see which Stripe account invoice details belong to", async () => {
      const res = await gqlWithRole("api")(queryStripeAccountLink);
      expect(res).not.toHaveProperty("errors");
    });

    test("cannot create, update, or delete team_invoice_details", () => {
      expect(i).toHaveNoMutationsFor("team_invoice_details");
    });
  });
});
