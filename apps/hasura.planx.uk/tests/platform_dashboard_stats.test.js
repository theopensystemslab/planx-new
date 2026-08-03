import { introspectAs } from "./utils.js";

describe("platform_dashboard_stats", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query platform_dashboard_stats", () => {
      expect(i.queries).not.toContain("platform_dashboard_stats");
    });

    test("cannot create, update, or delete platform_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("platform_dashboard_stats");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query platform_dashboard_stats", () => {
      expect(i.queries).toContain("platform_dashboard_stats");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query platform_dashboard_stats", () => {
      expect(i.queries).toContain("platform_dashboard_stats");
    });

    test("cannot create, update, or delete platform_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("platform_dashboard_stats");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query platform_dashboard_stats", () => {
      expect(i.queries).toContain("platform_dashboard_stats");
    });

    test("cannot create, update, or delete platform_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("platform_dashboard_stats");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("can query platform_dashboard_stats", () => {
      expect(i.queries).toContain("platform_dashboard_stats");
    });

    test("cannot create, update, or delete platform_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("platform_dashboard_stats");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query platform_dashboard_stats", () => {
      expect(i.queries).not.toContain("platform_dashboard_stats");
    });

    test("cannot create, update, or delete platform_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("platform_dashboard_stats");
    });
  });

  describe("analyst", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("analyst");
    });

    test("can query platform_dashboard_stats", () => {
      expect(i.queries).toContain("platform_dashboard_stats");
    });

    test("cannot create, update, or delete platform_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("platform_dashboard_stats");
    });
  });

  describe("teamViewer", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamViewer");
    });

    test("can query platform_dashboard_stats", () => {
      expect(i.queries).toContain("platform_dashboard_stats");
    });

    test("cannot create, update, or delete platform_dashboard_stats", () => {
      expect(i).toHaveNoMutationsFor("platform_dashboard_stats");
    });
  });
});
