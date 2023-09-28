const { introspectAs } = require("./utils");

describe("users", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query users", async () => {
      expect(i.queries).not.toContain("users");
    });

    test("cannot create, update, or delete users", async () => {
      expect(i).toHaveNoMutationsFor("users");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate users", async () => {
      expect(i.queries).toContain("users");
      expect(i.mutations).toContain("insert_users");
      expect(i.mutations).toContain("update_users_by_pk");
      expect(i.mutations).toContain("delete_users");
    });
  });
  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query users", () => {
      expect(i.queries).toContain("users");
    });

    test("can creates users", () => {
      expect(i.mutations).toContain("insert_users");
    });

    test("cannot update or delete users", () => {
      expect(i.mutations).not.toContain("update_users_by_pk");
      expect(i.mutations).not.toContain("update_users");
      expect(i.mutations).not.toContain("delete_users");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    // Row-level permissions tested in e2e/tests/api-driven
    // teamEditors can only query their own record
    test("can query users", async () => {
      expect(i.queries).toContain("users");
    });

    test("cannot create, update, or delete users", async () => {
      expect(i).toHaveNoMutationsFor("users");
    });
  });
});
