import { introspectAs } from "./utils.js";

describe("team_stripe_accounts", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query team_stripe_accounts", () => {
      expect(i.queries).not.toContain("team_stripe_accounts");
    });

    test("cannot create, update, or delete team_stripe_accounts", () => {
      expect(i).toHaveNoMutationsFor("team_stripe_accounts");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate team_stripe_accounts", () => {
      expect(i.queries).toContain("team_stripe_accounts");
      expect(i.mutations).toContain("insert_team_stripe_accounts");
      expect(i.mutations).toContain("update_team_stripe_accounts_by_pk");
      expect(i.mutations).toContain("delete_team_stripe_accounts");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query team_stripe_accounts", () => {
      expect(i.queries).toContain("team_stripe_accounts");
    });

    test("cannot create, update, or delete team_stripe_accounts", () => {
      expect(i).toHaveNoMutationsFor("team_stripe_accounts");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query team_stripe_accounts", () => {
      expect(i.queries).not.toContain("team_stripe_accounts");
    });

    test("cannot create, update, or delete team_stripe_accounts", () => {
      expect(i).toHaveNoMutationsFor("team_stripe_accounts");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query team_stripe_accounts", () => {
      expect(i.queries).not.toContain("team_stripe_accounts");
    });

    test("cannot create, update, or delete team_stripe_accounts", () => {
      expect(i).toHaveNoMutationsFor("team_stripe_accounts");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query team_stripe_accounts", () => {
      expect(i.queries).toContain("team_stripe_accounts");
    });

    test("can create and update (e.g. connected Stripe account id), but cannot delete team_stripe_accounts", () => {
      expect(i.mutations).toContain("insert_team_stripe_accounts_one");
      expect(i.mutations).toContain("update_team_stripe_accounts");
      expect(i.mutations).not.toContain("delete_team_stripe_accounts");
    });
  });
});
