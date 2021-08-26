const { introspectAs } = require("./utils");

describe("flows and operations", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query flows, but not the flows associated operations", () => {
      expect(i.queries).toContain("flows");
      expect(i.queries).not.toContain("operations");
    });

    test("cannot create, update, or delete flows or their associated operations", () => {
      expect(i).not.toHaveSomeMutationsFor("flows");
      expect(i).not.toHaveSomeMutationsFor("operations");
    });

    test("can query published flows", () => {
      expect(i.queries).toContain("published_flows");
    });

    test("public cannot create, update, or delete published_flows", () => {
      expect(i).not.toHaveSomeMutationsFor("published_flows");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can delete flows and their associated operations", () => {
      expect(i.mutations).toContain("delete_flows_by_pk");
      expect(i.mutations).toContain("delete_operations");
    });
  });
});
