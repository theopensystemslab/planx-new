const { introspectAs } = require("./utils");

describe("team_integrations", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query team_integrations", () => {
      expect(i.queries).not.toContain("team_integrations");
    });

    test("cannot create, update, or delete team_integrations", () => {
      expect(i).toHaveNoMutationsFor("team_integrations");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate team_integrations", () => {
      expect(i.queries).toContain("team_integrations");
      expect(i.mutations).toContain("insert_team_integrations");
      expect(i.mutations).toContain("update_team_integrations_by_pk");
      expect(i.mutations).toContain("delete_team_integrations");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query team_integrations", () => {
      expect(i.queries).not.toContain("team_integrations");
    });

    test("cannot create, update, or delete team_integrations", () => {
      expect(i).toHaveNoMutationsFor("team_integrations");
    });
  });

  describe("teamEditor", () => {
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query team_integrations", () => {
      expect(i.queries).not.toContain("team_integrations");
    });

    test("cannot create, update, or delete team_integrations", () => {
      expect(i).toHaveNoMutationsFor("team_integrations");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query team_integrations", () => {
      expect(i.queries).toContain("team_integrations");
    });

    test("cannot create, update, or delete team_integrations", () => {
      expect(i).toHaveNoMutationsFor("team_integrations");
    });
  });
});
