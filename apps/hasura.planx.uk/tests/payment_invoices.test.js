import { introspectAs } from "./utils.js";

describe("payment_invoices", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query payment_invoices", () => {
      expect(i.queries).not.toContain("payment_invoices");
    });

    test("cannot create, update, or delete payment_invoices", () => {
      expect(i).toHaveNoMutationsFor("payment_invoices");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate payment_invoices", () => {
      expect(i.queries).toContain("payment_invoices");
      expect(i.mutations).toContain("insert_payment_invoices");
      expect(i.mutations).toContain("update_payment_invoices");
      expect(i.mutations).toContain("delete_payment_invoices");
    });
  });

  // Invoices are served to editors via the API, which checks team membership
  describe.each([
    "platformAdmin",
    "teamAdmin",
    "teamEditor",
    "teamViewer",
    "analyst",
  ])("%s", (role) => {
    let i;
    beforeAll(async () => {
      i = await introspectAs(role);
    });

    test("cannot query payment_invoices", () => {
      expect(i.queries).not.toContain("payment_invoices");
    });

    test("cannot create, update, or delete payment_invoices", () => {
      expect(i).toHaveNoMutationsFor("payment_invoices");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query payment_invoices", () => {
      expect(i.queries).toContain("payment_invoices");
    });

    test("can insert payment_invoices", () => {
      expect(i.mutations).toContain("insert_payment_invoices");
    });

    // To attach the PDF once it's generated
    test("can update payment_invoices", () => {
      expect(i.mutations).toContain("update_payment_invoices");
    });

    test("cannot delete payment_invoices", () => {
      expect(i.mutations).not.toContain("delete_payment_invoices");
    });

    // Allocated by the set_payment_invoice_number trigger
    test("cannot query or mutate invoice_number_sequences", () => {
      expect(i.queries).not.toContain("invoice_number_sequences");
      expect(i).toHaveNoMutationsFor("invoice_number_sequences");
    });
  });
});
