const { introspectAs } = require("./utils");

describe("revoked_tokens", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query revoked_tokens", () => {
      expect(i.queries).not.toContain("revoked_tokens");
    });

    test("cannot create, update, or delete revoked_tokens", () => {
      expect(i).toHaveNoMutationsFor("revoked_tokens");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query revoked_tokens", () => {
      expect(i.queries).toContain("revoked_tokens");
    });

    test("can create, update, or delete revoked_tokens", () => {
      expect(i.mutations).toContain("insert_revoked_tokens");
      expect(i.mutations).toContain("insert_revoked_tokens_one");
      expect(i.mutations).toContain("update_revoked_tokens_by_pk");
      expect(i.mutations).toContain("delete_revoked_tokens_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query revoked_tokens", () => {
      expect(i.queries).not.toContain("revoked_tokens");
    });

    test("cannot create, update, or delete revoked_tokens", () => {
      expect(i).toHaveNoMutationsFor("revoked_tokens");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query revoked_tokens", () => {
      expect(i.queries).not.toContain("revoked_tokens");
    });

    test("cannot create, update, or delete revoked_tokens", () => {
      expect(i).toHaveNoMutationsFor("revoked_tokens");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query revoked_tokens", () => {
      expect(i.queries).not.toContain("revoked_tokens");
    });

    test("cannot create, update, or delete revoked_tokens", () => {
      expect(i).toHaveNoMutationsFor("revoked_tokens");
    });
  });

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("cannot query revoked_tokens", () => {
      expect(i.queries).not.toContain("revoked_tokens");
    });

    test("cannot create, update, or delete revoked_tokens", () => {
      expect(i).toHaveNoMutationsFor("revoked_tokens");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query revoked_tokens", () => {
      expect(i.queries).toContain("revoked_tokens");
    });

    test("cannot update revoked_tokens", () => {
      expect(i.mutations).not.toContain("update_revoked_tokens");
    });

    test("can delete revoked_tokens", () => {
      expect(i.mutations).toContain("delete_revoked_tokens");
    });

    test("can insert reconciliation requests", () => {
      expect(i.mutations).toContain("insert_revoked_tokens");
      expect(i.mutations).toContain("insert_revoked_tokens_one");
    });
  });
});
