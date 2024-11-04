const { introspectAs } = require("./utils");

describe("team_settings", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query team_settings", () => {
      expect(i.queries).toContain("team_settings");
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

    test("cannot query insert team_settings", () => {
      expect(i.queries).not.toContain("insert_team_settings");
    });

    test("can query team_settings", async () => {
      expect(i.queries).toContain("team_settings");
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
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query team_settings", () => {
      expect(i.queries).toContain("team_settings");
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

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("can query team_settings", () => {
      expect(i.queries).toContain("team_settings");
    });

    test("cannot create, update, or delete team_settings", () => {
      expect(i).toHaveNoMutationsFor("team_settings");
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

    test("cannot create, update, or delete team_settings", () => {
      expect(i).toHaveNoMutationsFor("team_settings");
    });
  });
});
