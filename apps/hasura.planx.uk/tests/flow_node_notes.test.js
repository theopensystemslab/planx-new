const { introspectAs } = require("./utils");

describe("flow node notes", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query flow_node_notes", () => {
      expect(i.queries).not.toContain("flow_node_notes");
    });

    test("cannot create, update, or delete flow_node_notes", () => {
      expect(i).toHaveNoMutationsFor("flow_node_notes");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query flow_node_notes", () => {
      expect(i.queries).toContain("flow_node_notes");
    });

    test("can create flow_node_notes", () => {
      expect(i.mutations).toContain("insert_flow_node_notes");
    });

    test("can update flow_node_notes", () => {
      expect(i.mutations).toContain("update_flow_node_notes");
      expect(i.mutations).toContain("update_flow_node_notes_by_pk");
    });

    test("can delete flow_node_notes", () => {
      expect(i.mutations).toContain("delete_flow_node_notes");
      expect(i.mutations).toContain("delete_flow_node_notes_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query flow_node_notes", () => {
      expect(i.queries).toContain("flow_node_notes");
    });

    test("can create flow_node_notes", () => {
      expect(i.mutations).toContain("insert_flow_node_notes");
    });

    test("can update flow_node_notes", () => {
      expect(i.mutations).toContain("update_flow_node_notes");
      expect(i.mutations).toContain("update_flow_node_notes_by_pk");
    });

    test("can delete flow_node_notes", () => {
      expect(i.mutations).toContain("delete_flow_node_notes");
      expect(i.mutations).toContain("delete_flow_node_notes_by_pk");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query flow_node_notes", () => {
      expect(i.queries).toContain("flow_node_notes");
    });

    test("can create flow_node_notes", () => {
      expect(i.mutations).toContain("insert_flow_node_notes");
    });

    test("can update flow_node_notes", () => {
      expect(i.mutations).toContain("update_flow_node_notes");
      expect(i.mutations).toContain("update_flow_node_notes_by_pk");
    });

    test("can delete flow_node_notes", () => {
      expect(i.mutations).toContain("delete_flow_node_notes");
      expect(i.mutations).toContain("delete_flow_node_notes_by_pk");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query flow_node_notes", () => {
      expect(i.queries).not.toContain("flow_node_notes");
    });

    test("cannot create, update, or delete flow_node_notes", () => {
      expect(i).toHaveNoMutationsFor("flow_node_notes");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query flow_node_notes", () => {
      expect(i.queries).not.toContain("flow_node_notes");
    });

    test("cannot create, update, or delete flow_node_notes", () => {
      expect(i).toHaveNoMutationsFor("flow_node_notes");
    });
  });
});
