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

    test("can create analytics but not update or delete them", () => {
      expect(i.mutations).toContain("insert_analytics_one");
      expect(i.mutations).not.toContain("update_analytics_by_pk");
      expect(i.mutations).not.toContain("update_analytics");
      expect(i.mutations).not.toContain("delete_analytics");
      expect(i.mutations).not.toContain("delete_analytics_by_pk");
    });

    test("can create and update analytics_log but not delete them", () => {
      expect(i.mutations).toContain("insert_analytics_logs_one");
      expect(i.mutations).toContain("update_analytics_logs_by_pk");
      expect(i.mutations).not.toContain("delete_analytics_logs");
      expect(i.mutations).not.toContain("delete_analytics_logs_by_pk");
    })
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

  describe("platformManager", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformManager");
    });

    test("cannot query analytics_logs", () => {
      expect(i.queries).not.toContain("analytics_logs");
    });

    test("cannot create, update, or delete analytics_logs", () => {
      expect(i).toHaveNoMutationsFor("analytics_logs");
    });
  });
});
