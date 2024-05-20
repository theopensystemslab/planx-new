const { introspectAs } = require("./utils");

describe("flows status history", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query flow_status_history", () => {
      expect(i.queries).not.toContain("flow_status_history");
    });

    test("cannot create, update, or delete flows or their associated operations", () => {
      expect(i).toHaveNoMutationsFor("flow_status_history");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to flow_status_history", () => {
      expect(i.queries).toContain("flow_status_history");
      expect(i.mutations).toContain("insert_flow_status_history");
      expect(i.mutations).toContain("insert_flow_status_history_one");
      expect(i.mutations).toContain("update_flow_status_history_by_pk");
      expect(i.mutations).toContain("delete_flow_status_history");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query flow_status_history", () => {
      expect(i.queries).not.toContain("flow_status_history");
    });

    test("cannot create, update, or delete flows or their associated operations", () => {
      expect(i).toHaveNoMutationsFor("flow_status_history");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query flow_status_history", () => {
      expect(i.queries).not.toContain("flow_status_history");
    });

    test("cannot create, update, or delete flows or their associated operations", () => {
      expect(i).toHaveNoMutationsFor("flow_status_history");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query flow_status_history", () => {
      expect(i.queries).not.toContain("flow_status_history");
    });

    test("cannot create, update, or delete flows or their associated operations", () => {
      expect(i).toHaveNoMutationsFor("flow_status_history");
    });
  });
});
