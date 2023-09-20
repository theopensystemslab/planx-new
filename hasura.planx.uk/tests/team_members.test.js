const { introspectAs } = require("./utils");

describe("team_members", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query teams", () => {
      expect(i.queries).not.toContain("team_members");
    });

    test("cannot create, update, or delete team_members", () => {
      expect(i).toHaveNoMutationsFor("team_members");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate team_members", () => {
      expect(i.queries).toContain("team_members");
      expect(i.mutations).toContain("insert_team_members");
      expect(i.mutations).toContain("update_team_members_by_pk");
      expect(i.mutations).toContain("delete_team_members");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("has full access to query and mutate team_members", () => {
      expect(i.queries).toContain("team_members");
      expect(i.mutations).toContain("insert_team_members");
      expect(i.mutations).toContain("update_team_members_by_pk");
      expect(i.mutations).toContain("delete_team_members");
    });
  });

  describe("teamEditor", () => {
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });
    
    // Row-level permissions tested in e2e/tests/api-driven
    // teamEditors can only query their own record
    test("can query teams", () => {
      expect(i.queries).toContain("team_members");
    });

    test("cannot create, update, or delete team_members", () => {
      expect(i).toHaveNoMutationsFor("team_members");
    });
  });
});
