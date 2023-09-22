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
      expect(i).toHaveNoMutationsFor("flows");
      expect(i).toHaveNoMutationsFor("operations");
    });

    test("can query published flows", () => {
      expect(i.queries).toContain("published_flows");
    });

    test("cannot create, update, or delete published_flows", () => {
      expect(i).toHaveNoMutationsFor("published_flows");
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
  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query flows and their associated operations", () => {
      expect(i.queries).toContain("flows");
      expect(i.queries).toContain("operations");
    });

    test("can update flows and their associated operations", () => {
      expect(i.mutations).toContain("update_flows_by_pk");
      expect(i.mutations).toContain("update_flows");
      expect(i.mutations).toContain("update_operations_by_pk");
      expect(i.mutations).toContain("update_operations");
    });

    test("can create flows and their associated operations", () => {
      expect(i.mutations).toContain("insert_flows_one");
      expect(i.mutations).toContain("insert_flows");
      expect(i.mutations).toContain("insert_operations_one");
      expect(i.mutations).toContain("insert_operations");
    });

    test("cannot delete operations", () => {
      expect(i.mutations).not.toContain("delete_operations_by_pk");
      expect(i.mutations).not.toContain("delete_operations");
    });

    test("can query published flows", () => {
      expect(i.queries).toContain("published_flows");
    });

    test("can create published_flows", () => {
      expect(i.mutations).toContain("insert_published_flows_one");
      expect(i.mutations).toContain("insert_published_flows");
    });

    test("cannot update or delete published_flows", () => {
      expect(i.mutations).not.toContain("delete_published_flows_by_pk");
      expect(i.mutations).not.toContain("delete_published_flows");
      expect(i.mutations).not.toContain("update_published_flows_by_pk");
      expect(i.mutations).not.toContain("update_published_flows");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query flows and their associated operations", () => {
      expect(i.queries).toContain("flows");
      expect(i.queries).toContain("operations");
    });

    test("can update flows and their associated operations", () => {
      expect(i.mutations).toContain("update_flows_by_pk");
      expect(i.mutations).toContain("update_flows");
      expect(i.mutations).toContain("update_operations_by_pk");
      expect(i.mutations).toContain("update_operations");
    });

    test("can create flows and their associated operations", () => {
      expect(i.mutations).toContain("insert_flows_one");
      expect(i.mutations).toContain("insert_flows");
      expect(i.mutations).toContain("insert_operations_one");
      expect(i.mutations).toContain("insert_operations");
    });

    test("can delete flows", () => {
      expect(i.mutations).toContain("delete_flows_by_pk");
      expect(i.mutations).toContain("delete_flows");
    });

    test("cannot delete operations", () => {
      expect(i.mutations).not.toContain("delete_operations_by_pk");
      expect(i.mutations).not.toContain("delete_operations");
    });

    test("can query published flows", () => {
      expect(i.queries).toContain("published_flows");
    });

    test("can create published_flows", () => {
      expect(i.mutations).toContain("insert_published_flows_one");
      expect(i.mutations).toContain("insert_published_flows");
    });

    test("cannot update or delete published_flows", () => {
      expect(i.mutations).not.toContain("delete_published_flows_by_pk");
      expect(i.mutations).not.toContain("delete_published_flows");
      expect(i.mutations).not.toContain("update_published_flows_by_pk");
      expect(i.mutations).not.toContain("update_published_flows");
    });
  });
});
