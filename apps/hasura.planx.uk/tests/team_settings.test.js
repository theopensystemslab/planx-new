import { gqlWithRole, introspectAs } from "./utils.js";

const queryFlag = `
  query {
    team_settings {
      multiple_stripe_accounts_enabled
    }
  }
`;

const updateFlag = `
  mutation {
    update_team_settings(
      where: { id: { _eq: -1 } }
      _set: { multiple_stripe_accounts_enabled: false }
    ) {
      affected_rows
    }
  }
`;

describe("team_settings", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query team_settings", () => {
      expect(i.queries).toContain("team_settings");
    });

    test("cannot see whether multiple Stripe accounts are enabled", async () => {
      const res = await gqlWithRole("public")(queryFlag);
      expect(res).toHaveProperty("errors");
    });

    test("cannot create, update, or delete team_settings", () => {
      expect(i).toHaveNoMutationsFor("team_settings");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query team_settings and team members", () => {
      expect(i.queries).toContain("team_settings");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query team_settings", () => {
      expect(i.queries).toContain("team_settings");
    });

    test("can see and set whether multiple Stripe accounts are enabled", async () => {
      const gql = gqlWithRole("platformAdmin");
      expect(await gql(queryFlag)).not.toHaveProperty("errors");
      expect(await gql(updateFlag)).not.toHaveProperty("errors");
    });

    test("cannot query insert team_settings", () => {
      expect(i.queries).not.toContain("insert_team_settings");
    });

    test("can insert team_settings", () => {
      expect(i.mutations).toContain("insert_team_settings");
    });

    test("can mutate team_settings", async () => {
      expect(i.mutations).toContain("update_team_settings");
      expect(i.mutations).toContain("update_team_settings_by_pk");
    });

    test("cannot delete team_settings", async () => {
      expect(i.mutations).not.toContain("delete_team_settings");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query team_settings", () => {
      expect(i.queries).toContain("team_settings");
    });

    test("cannot see or set whether multiple Stripe accounts are enabled", async () => {
      const gql = gqlWithRole("teamEditor");
      expect(await gql(queryFlag)).toHaveProperty("errors");
      expect(await gql(updateFlag)).toHaveProperty("errors");
    });

    test("can update team_settings", () => {
      expect(i.mutations).toContain("update_team_settings");
      expect(i.mutations).toContain("update_team_settings_by_pk");
    });

    test("cannot delete team_settings", async () => {
      expect(i.mutations).not.toContain("delete_team_settings");
    });

    test("cannot insert team_settings", async () => {
      expect(i.mutations).not.toContain("insert_team_settings");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query team_settings", () => {
      expect(i.queries).not.toContain("team_settings");
    });

    test("cannot update team_settings", () => {
      expect(i.mutations).not.toContain("update_team_settings");
      expect(i.mutations).not.toContain("update_team_settings_by_pk");
    });

    test("cannot delete team_settings", async () => {
      expect(i.mutations).not.toContain("delete_team_settings");
    });

    test("cannot insert team_settings", async () => {
      expect(i.mutations).not.toContain("insert_team_settings");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query team_settings", () => {
      expect(i.queries).toContain("team_settings");
    });

    test("can see, but not set, whether multiple Stripe accounts are enabled", async () => {
      const gql = gqlWithRole("api");
      expect(await gql(queryFlag)).not.toHaveProperty("errors");
      expect(await gql(updateFlag)).toHaveProperty("errors");
    });

    test("can update (e.g. payment provider), but cannot create or delete team_settings", () => {
      expect(i.mutations).toContain("update_team_settings");
      expect(i.mutations).not.toContain("insert_team_settings");
      expect(i.mutations).not.toContain("delete_team_settings");
    });
  });
});
