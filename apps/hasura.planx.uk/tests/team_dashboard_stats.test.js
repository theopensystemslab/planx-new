const { introspectAs } = require("./utils");

describe("team_dashboard_stats", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query team_dashboard_stats", () => {
      expect(i.queries).not.toContain("team_dashboard_stats");
    });

    test("cannot create, update, or delete team_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("team_dashboard_stats");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query team_dashboard_stats", () => {
      expect(i.queries).toContain("team_dashboard_stats");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query team_dashboard_stats", () => {
      expect(i.queries).toContain("team_dashboard_stats");
    });

    test("cannot create, update, or delete team_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("team_dashboard_stats");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query team_dashboard_stats", () => {
      expect(i.queries).toContain("team_dashboard_stats");
    });

    test("cannot create, update, or delete team_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("team_dashboard_stats");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query team_dashboard_stats", () => {
      expect(i.queries).not.toContain("team_dashboard_stats");
    });

    test("cannot create, update, or delete team_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("team_dashboard_stats");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query team_dashboard_stats", () => {
      expect(i.queries).not.toContain("team_dashboard_stats");
    });

    test("cannot create, update, or delete team_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("team_dashboard_stats");
    });
  });

  describe("analyst", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("analyst");
    });

    test("cannot query team_dashboard_stats", () => {
      expect(i.queries).not.toContain("team_dashboard_stats");
    });

    test("cannot create, update, or delete team_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("team_dashboard_stats");
    });
  });
});
