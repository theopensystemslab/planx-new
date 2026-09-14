import { introspectAs } from "./utils.js";

describe("stripe_payment_status_enum", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot INSERT records", () => {
      expect(i.mutations).not.toContain("insert_stripe_payment_status_enum");
    });

    test("cannot QUERY records", () => {
      expect(i.queries).not.toContain("stripe_payment_status_enum");
    });

    test("cannot DELETE records", () => {
      expect(i.mutations).not.toContain("delete_stripe_payment_status_enum");
    });

    test("cannot UPDATE records", () => {
      expect(i.mutations).not.toContain("update_stripe_payment_status_enum");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate stripe_payment_status_enum", async () => {
      expect(i.queries).toContain("stripe_payment_status_enum");
      expect(i.mutations).toContain("insert_stripe_payment_status_enum");
      expect(i.mutations).toContain("delete_stripe_payment_status_enum");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query stripe_payment_status_enum", () => {
      expect(i.queries).not.toContain("stripe_payment_status_enum");
    });

    test("cannot create, update, or delete stripe_payment_status_enum", () => {
      expect(i).toHaveNoMutationsFor("stripe_payment_status_enum");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query stripe_payment_status_enum", () => {
      expect(i.queries).not.toContain("stripe_payment_status_enum");
    });

    test("cannot create, update, or delete stripe_payment_status_enum", () => {
      expect(i).toHaveNoMutationsFor("stripe_payment_status_enum");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query stripe_payment_status_enum", () => {
      expect(i.queries).not.toContain("stripe_payment_status_enum");
    });

    test("cannot create, update, or delete stripe_payment_status_enum", () => {
      expect(i).toHaveNoMutationsFor("stripe_payment_status_enum");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query stripe_payment_status_enum", () => {
      expect(i.queries).not.toContain("stripe_payment_status_enum");
    });

    test("cannot create, update, or delete stripe_payment_status_enum", () => {
      expect(i.mutations).not.toContain("insert_stripe_payment_status_enum");
      expect(i.mutations).not.toContain("update_stripe_payment_status_enum");
      expect(i.mutations).not.toContain("delete_stripe_payment_status_enum");
    });
  });
});
