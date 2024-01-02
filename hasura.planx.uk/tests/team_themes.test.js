const { introspectAs } = require("./utils");

describe("team_themes", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query team_themes", () => {
      expect(i.queries).toContain("team_themes");
    });

    test("cannot create, update, or delete team_themes", () => {
      expect(i).toHaveNoMutationsFor("team_themes");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query team_themes and team members", () => {
      expect(i.queries).toContain("team_themes");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query team_themes", () => {
      expect(i.queries).toContain("team_themes");
    });

    test("cannot insert team_themes", () => {
      expect(i.queries).not.toContain("insert_team_themes");
    });

    test("can query team_themes", async () => {
      expect(i.queries).toContain("team_themes");
    });

    test("can mutate team_themes", async () => {
      expect(i.mutations).toContain("update_team_themes");
      expect(i.mutations).toContain("update_team_themes_by_pk");
    });

    test("cannot delete team_themes", async () => {
      expect(i.mutations).not.toContain("delete_team_themes");
    });
  });

  describe("teamEditor", () => {
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query team_themes", () => {
      expect(i.queries).toContain("team_themes");
    });

    test("can update team_themes", () => {
      expect(i.mutations).toContain("update_team_themes");
      expect(i.mutations).toContain("update_team_themes_by_pk");
    });

    test("cannot delete team_themes", async () => {
      expect(i.mutations).not.toContain("delete_team_themes");
    });

    test("cannot insert team_themes", async () => {
      expect(i.mutations).not.toContain("insert_team_themes");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query team_themes", () => {
      expect(i.queries).toContain("team_themes");
    });

    test("cannot create, update, or delete team_themes", () => {
      expect(i).toHaveNoMutationsFor("team_themes");
    });
  });
});
