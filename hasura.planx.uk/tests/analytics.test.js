const { introspectAs } = require("./utils");

describe("analytics and analytics_logs", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query analytics and their associated analytics_logs", () => {
      expect(i.queries).toContain("analytics");
      expect(i.queries).toContain("analytics_logs");
    });

    test("can create analytics", () => {
      expect(i.mutations).toContain("insert_analytics_one");
    });

    test("can update analytics", () => {
      expect(i.mutations).toContain("update_analytics_by_pk");
      expect(i.mutations).toContain("update_analytics");
    });

    test("cannot delete analytics", () => {
      expect(i.mutations).not.toContain("delete_analytics");
      expect(i.mutations).not.toContain("delete_analytics_by_pk");
    });

    test("can create and update analytics_log but not delete them", () => {
      expect(i.mutations).toContain("insert_analytics_logs_one");
      expect(i.mutations).toContain("update_analytics_logs_by_pk");
      expect(i.mutations).not.toContain("delete_analytics_logs");
      expect(i.mutations).not.toContain("delete_analytics_logs_by_pk");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can delete analytics and session events", () => {
      expect(i.mutations).toContain("delete_analytics");
      expect(i.mutations).toContain("delete_analytics_logs");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query analytics_logs", () => {
      expect(i.queries).not.toContain("analytics_logs");
    });

    test("cannot create, update, or delete analytics_logs", () => {
      expect(i).toHaveNoMutationsFor("analytics_logs");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query analytics_logs", () => {
      expect(i.queries).not.toContain("analytics_logs");
    });

    test("cannot create, update, or delete analytics_logs", () => {
      expect(i).toHaveNoMutationsFor("analytics_logs");
    });
  });

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("cannot query analytics_logs", () => {
      expect(i.queries).not.toContain("analytics_logs");
    });

    test("cannot create, update, or delete analytics_logs", () => {
      expect(i).toHaveNoMutationsFor("analytics_logs");
    });
  });

  describe("api", () => {
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query analytics", () => {
      expect(i.queries).not.toContain("analytics");
    });

    test("cannot query analytics_logs", () => {
      expect(i.queries).not.toContain("analytics_logs");
    });

    test("cannot create, update, or delete analytics", () => {
      expect(i).toHaveNoMutationsFor("analytics");
    });

    test("cannot create, update, or delete analytics_logs", () => {
      expect(i).toHaveNoMutationsFor("analytics_logs");
    });
  });
});
