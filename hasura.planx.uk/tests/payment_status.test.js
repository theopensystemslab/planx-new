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
});
