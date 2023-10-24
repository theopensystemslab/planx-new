const { introspectAs } = require("./utils");

describe("flow_document_templates", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    // TODO: Check this - seems unnecessary / incorrect?
    test.skip("cannot query flow_document_templates", () => {
      expect(i.queries).not.toContain("flow_document_templates");
    });

    test("cannot create, update, or delete flow_document_templates", () => {
      expect(i).toHaveNoMutationsFor("flow_document_templates");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query flow_document_templates", () => {
      expect(i.queries).toContain("flow_document_templates");
    });

    test("can create, update, or delete flow_document_templates", () => {
      expect(i.mutations).toContain("insert_flow_document_templates");
      expect(i.mutations).toContain("insert_flow_document_templates_one");
      expect(i.mutations).toContain("update_flow_document_templates_by_pk");
      expect(i.mutations).toContain("delete_flow_document_templates_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query flow_document_templates", () => {
      expect(i.queries).not.toContain("flow_document_templates");
    });

    test("cannot create, update, or delete flow_document_templates", () => {
      expect(i).toHaveNoMutationsFor("flow_document_templates");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query flow_document_templates", () => {
      expect(i.queries).not.toContain("flow_document_templates");
    });

    test("cannot create, update, or delete flow_document_templates", () => {
      expect(i).toHaveNoMutationsFor("flow_document_templates");
    });
  });

  describe("api", () => {
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query flow_document_templates", () => {
      expect(i.queries).toContain("flow_document_templates");
    });

    test("cannot create, update, or delete flow_document_templates", () => {
      expect(i).toHaveNoMutationsFor("flow_document_templates");
    });
  });
});
