const { introspectAs } = require("./utils");

describe("user_pinned_flows", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query user_pinned_flows", () => {
      expect(i.queries).not.toContain("user_pinned_flows");
    });

    test("cannot create, update, or delete user_pinned_flows", () => {
      expect(i).toHaveNoMutationsFor("user_pinned_flows");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query user_pinned_flows", () => {
      expect(i.queries).toContain("user_pinned_flows");
    });

    test("can create user_pinned_flows", () => {
      expect(i.mutations).toContain("insert_user_pinned_flows");
    });

    test("can delete user_pinned_flows", () => {
      expect(i.mutations).toContain("delete_user_pinned_flows");
      expect(i.mutations).toContain("delete_user_pinned_flows_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query user_pinned_flows", () => {
      expect(i.queries).toContain("user_pinned_flows");
    });

    test("can create user_pinned_flows", () => {
      expect(i.mutations).toContain("insert_user_pinned_flows");
    });

    test("cannot update user_pinned_flows", () => {
      expect(i.mutations).not.toContain("update_user_pinned_flows");
      expect(i.mutations).not.toContain("update_user_pinned_flows_by_pk");
    });

    test("can delete user_pinned_flows", () => {
      expect(i.mutations).toContain("delete_user_pinned_flows");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query user_pinned_flows", () => {
      expect(i.queries).toContain("user_pinned_flows");
    });

    test("can create user_pinned_flows", () => {
      expect(i.mutations).toContain("insert_user_pinned_flows");
    });

    test("cannot update user_pinned_flows", () => {
      expect(i.mutations).not.toContain("update_user_pinned_flows");
      expect(i.mutations).not.toContain("update_user_pinned_flows_by_pk");
    });

    test("can delete user_pinned_flows", () => {
      expect(i.mutations).toContain("delete_user_pinned_flows");
    });
  });

  describe("analyst", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("analyst");
    });

    test("can query user_pinned_flows", () => {
      expect(i.queries).toContain("user_pinned_flows");
    });

    test("cannot create, update, or delete user_pinned_flows", () => {
      expect(i).toHaveNoMutationsFor("user_pinned_flows");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query user_pinned_flows", () => {
      expect(i.queries).not.toContain("user_pinned_flows");
    });

    test("cannot create, update, or delete user_pinned_flows", () => {
      expect(i).toHaveNoMutationsFor("user_pinned_flows");
    });
  });
});
