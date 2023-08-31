const { introspectAs } = require("./utils");

describe("teams", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query teams", () => {
      expect(i.queries).toContain("teams");
    });

    test("cannot create, update, or delete teams", () => {
      expect(i).toHaveNoMutationsFor("teams");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query teams and team members", () => {
      expect(i.queries).toContain("teams");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
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

  describe("teamEditor", () => {
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query teams", () => {
      expect(i.queries).toContain("teams");
    });

    test("can update teams", () => {
      expect(i.mutations).toContain("update_teams");
      expect(i.mutations).toContain("update_teams_by_pk");
    });

    test("cannot delete teams", async () => {
      expect(i.mutations).not.toContain("delete_teams");
    });

    test("cannot insert teams", async () => {
      expect(i.mutations).not.toContain("insert_teams");
    });
  });
});
