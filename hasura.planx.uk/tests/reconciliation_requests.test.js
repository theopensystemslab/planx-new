const { introspectAs } = require("./utils");

describe("reconciliation_requests", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query reconciliation_requests", () => {
      expect(i.queries).not.toContain("reconciliation_requests");
    });

    test("cannot create, update, or delete reconciliation_requests", () => {
      expect(i).toHaveNoMutationsFor("reconciliation_requests");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query reconciliation_requests", () => {
      expect(i.queries).toContain("reconciliation_requests");
    });

    test("can create, update, or delete reconciliation_requests", () => {
      expect(i.mutations).toContain("insert_reconciliation_requests");
      expect(i.mutations).toContain("insert_reconciliation_requests_one");
      expect(i.mutations).toContain("update_reconciliation_requests_by_pk");
      expect(i.mutations).toContain("delete_reconciliation_requests_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query reconciliation_requests", () => {
      expect(i.queries).not.toContain("reconciliation_requests");
    });

    test("cannot create, update, or delete reconciliation_requests", () => {
      expect(i).toHaveNoMutationsFor("reconciliation_requests");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query reconciliation_requests", () => {
      expect(i.queries).not.toContain("reconciliation_requests");
    });

    test("cannot create, update, or delete reconciliation_requests", () => {
      expect(i).toHaveNoMutationsFor("reconciliation_requests");
    });
  });

  describe("api", () => {
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query reconciliation_requests", () => {
      expect(i.queries).toContain("reconciliation_requests");
    });

    test("cannot update reconciliation_requests", () => {
      expect(i.mutations).not.toContain("update_reconciliation_requests");
    });

    test("can delete reconciliation_requests", () => {
      expect(i.mutations).toContain("delete_reconciliation_requests");
    });

    test("can insert reconciliation requests", () => {
      expect(i.mutations).toContain("insert_reconciliation_requests");
      expect(i.mutations).toContain("insert_reconciliation_requests_one");
    });
  });
});
