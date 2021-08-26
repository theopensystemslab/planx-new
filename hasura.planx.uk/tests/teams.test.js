const { introspectAs } = require("./utils");

describe("teams and team_members", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query teams, but not their associated team members", () => {
      expect(i.queries).toContain("teams");
      expect(i.queries).not.toContain("team_members");
    });

    test("cannot create, update, or delete teams or team members", () => {
      expect(i).not.toHaveSomeMutationsFor("teams");
      expect(i).not.toHaveSomeMutationsFor("team_members");
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
});
