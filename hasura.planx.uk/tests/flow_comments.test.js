const { introspectAs } = require("./utils");

describe("flow comments", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query flow_comments", () => {
      expect(i.queries).not.toContain("flow_comments");
    });

    test("cannot create, update, or delete flow_comments", () => {
      expect(i).toHaveNoMutationsFor("flow_comments");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query flow_comments", () => {
      expect(i.queries).toContain("flow_comments");
    });

    test("can create flow_comments", () => {
      expect(i.mutations).toContain("insert_flow_comments");
    });

    test("can update flow_comments", () => {
      expect(i.mutations).toContain("update_flow_comments");
      expect(i.mutations).toContain("update_flow_comments_by_pk");
    });

    test("can delete flow_comments", () => {
      expect(i.mutations).toContain("delete_flow_comments");
      expect(i.mutations).toContain("delete_flow_comments_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query flow_comments", () => {
      expect(i.queries).toContain("flow_comments");
    });

    test("can create flow_comments", () => {
      expect(i.mutations).toContain("insert_flow_comments");
    });

    test("cannot update flow_comments", () => {
      expect(i.mutations).not.toContain("update_flow_comments");
      expect(i.mutations).not.toContain("update_flow_comments_by_pk");
    });

    test("can delete flow_comments", () => {
      expect(i.mutations).toContain("delete_flow_comments");
      expect(i.mutations).toContain("delete_flow_comments_by_pk");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query flow_comments", () => {
      expect(i.queries).toContain("flow_comments");
    });

    test("can create flow_comments", () => {
      expect(i.mutations).toContain("insert_flow_comments");
    });

    test("cannot update flow_comments", () => {
      expect(i.mutations).not.toContain("update_flow_comments");
      expect(i.mutations).not.toContain("update_flow_comments_by_pk");
    });

    test("can delete flow_comments", () => {
      expect(i.mutations).toContain("delete_flow_comments");
      expect(i.mutations).toContain("delete_flow_comments_by_pk");
    });
  });
  
  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("can query flow_comments", () => {
      expect(i.queries).toContain("flow_comments");
    });

    test("can create flow_comments", () => {
      expect(i.mutations).toContain("insert_flow_comments");
    });

    test("cannot update flow_comments", () => {
      expect(i.mutations).not.toContain("update_flow_comments");
      expect(i.mutations).not.toContain("update_flow_comments_by_pk");
    });

    test("can delete flow_comments", () => {
      expect(i.mutations).toContain("delete_flow_comments");
      expect(i.mutations).toContain("delete_flow_comments_by_pk");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query flow_comments", () => {
      expect(i.queries).not.toContain("flow_comments");
    });

    test("cannot create, update, or delete flow_comments", () => {
      expect(i).toHaveNoMutationsFor("flow_comments");
    });
  });
});