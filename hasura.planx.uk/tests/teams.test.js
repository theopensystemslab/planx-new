const { introspectAs } = require("./utils");

describe("teams", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query teams, but not their associated team members", () => {
      expect(i.queries).toContain("teams");
      expect(i.queries).not.toContain("team_members");
    });

    test("cannot create, update, or delete teams or team_members", () => {
      expect(i).toHaveNoMutationsFor("teams");
      expect(i).toHaveNoMutationsFor("team_members");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query teams and team members", () => {
      expect(i.queries).toContain("teams");
      expect(i.queries).toContain("team_members");
    });
  });

  describe("platformManager", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformManager");
    });

    test("can query teams and team members", () => {
      expect(i.queries).toContain("teams");
    });

    test("has full access to query and mutate teams", async () => {
      expect(i.queries).toContain("teams");

      expect(i.mutations).toContain("insert_teams");
      expect(i.mutations).toContain("update_teams_by_pk");
    });

    test("cannot delete teams", async () => {
      expect(i.mutations).not.toContain("delete_teams");
    });
  });
});
