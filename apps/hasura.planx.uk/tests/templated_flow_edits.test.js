const { introspectAs } = require("./utils");

describe("flow template edits", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query templated_flow_edits", () => {
      expect(i.queries).not.toContain("templated_flow_edits");
    });

    test("cannot create, update, or delete templated_flow_edits", () => {
      expect(i).toHaveNoMutationsFor("templated_flow_edits");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query templated_flow_edits", () => {
      expect(i.queries).toContain("templated_flow_edits");
    });

    test("can create templated_flow_edits", () => {
      expect(i.mutations).toContain("insert_templated_flow_edits");
    });

    test("can update templated_flow_edits", () => {
      expect(i.mutations).toContain("update_templated_flow_edits");
      expect(i.mutations).toContain("update_templated_flow_edits_by_pk");
    });

    test("cannot delete templated_flow_edits", () => {
      expect(i.mutations).toContain("delete_templated_flow_edits");
      expect(i.mutations).toContain("delete_templated_flow_edits_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query templated_flow_edits", () => {
      expect(i.queries).toContain("templated_flow_edits");
    });

    test("can create templated_flow_edits", () => {
      expect(i.mutations).toContain("insert_templated_flow_edits");
    });

    test("can update templated_flow_edits", () => {
      expect(i.mutations).toContain("update_templated_flow_edits");
      expect(i.mutations).toContain("update_templated_flow_edits_by_pk");
    });

    test("can delete templated_flow_edits", () => {
      expect(i.mutations).toContain("delete_templated_flow_edits");
      expect(i.mutations).toContain("delete_templated_flow_edits_by_pk");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query templated_flow_edits", () => {
      expect(i.queries).toContain("templated_flow_edits");
    });

    test("can create templated_flow_edits", () => {
      expect(i.mutations).toContain("insert_templated_flow_edits");
    });

    test("can update templated_flow_edits", () => {
      expect(i.mutations).toContain("update_templated_flow_edits");
      expect(i.mutations).toContain("update_templated_flow_edits_by_pk");
    });

    test("cannot delete templated_flow_edits", () => {
      expect(i.mutations).not.toContain("delete_templated_flow_edits");
      expect(i.mutations).not.toContain("delete_templated_flow_edits_by_pk");
    });
  });
  
  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("can query templated_flow_edits", () => {
      expect(i.queries).toContain("templated_flow_edits");
    });

    test("can create templated_flow_edits", () => {
      expect(i.mutations).toContain("insert_templated_flow_edits");
    });

    test("can update templated_flow_edits", () => {
      expect(i.mutations).toContain("update_templated_flow_edits");
      expect(i.mutations).toContain("update_templated_flow_edits_by_pk");
    });

    test("cannot delete templated_flow_edits", () => {
      expect(i.mutations).not.toContain("delete_templated_flow_edits");
      expect(i.mutations).not.toContain("delete_templated_flow_edits_by_pk");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query templated_flow_edits", () => {
      expect(i.queries).toContain("templated_flow_edits");
    });

    test("can create templated_flow_edits", () => {
      expect(i.mutations).toContain("insert_templated_flow_edits");
    });

    test("can update templated_flow_edits", () => {
      expect(i.mutations).toContain("update_templated_flow_edits");
      expect(i.mutations).toContain("update_templated_flow_edits_by_pk");
    });

    test("cannot delete templated_flow_edits", () => {
      expect(i.mutations).not.toContain("delete_templated_flow_edits");
      expect(i.mutations).not.toContain("delete_templated_flow_edits_by_pk");
    });
  });
});
