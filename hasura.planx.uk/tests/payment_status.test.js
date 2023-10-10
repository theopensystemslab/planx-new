const { introspectAs } = require("./utils");

describe("payment_status", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot INSERT records", () => {
      expect(i.mutations).not.toContain("insert_payment_status");
    });

    test("cannot QUERY records", () => {
      expect(i.queries).not.toContain("payment_status");
    });

    test("cannot DELETE records", () => {
      expect(i.mutations).not.toContain("delete_payment_status");
    });

    test("cannot UPDATE records", () => {
      expect(i.mutations).not.toContain("update_payment_status");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate payment_status", async () => {
      expect(i.queries).toContain("payment_status");
      expect(i.mutations).toContain("insert_payment_status");
      expect(i.mutations).toContain("delete_payment_status");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query payment_status", () => {
      expect(i.queries).not.toContain("payment_status");
    });

    test("cannot create, update, or delete payment_status", () => {
      expect(i).toHaveNoMutationsFor("payment_status");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query payment_status", () => {
      expect(i.queries).not.toContain("payment_status");
    });

    test("cannot create, update, or delete payment_status", () => {
      expect(i).toHaveNoMutationsFor("payment_status");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query payment_status", () => {
      expect(i.queries).not.toContain("payment_status");
    })

    test("can insert payment_status", () => {
      expect(i.mutations).toContain("insert_payment_status");
    });

    test("cannot delete or update payment_status", () => {
      expect(i.mutations).not.toContain("update_payment_status");
      expect(i.mutations).not.toContain("delete_payment_status");
    })
  });
});
