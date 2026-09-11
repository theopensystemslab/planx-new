import { introspectAs } from "./utils.js";

describe("team_invoice_details", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query team_invoice_details", () => {
      expect(i.queries).not.toContain("team_invoice_details");
    });

    test("cannot create, update, or delete team_invoice_details", () => {
      expect(i).toHaveNoMutationsFor("team_invoice_details");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query team_invoice_details", () => {
      expect(i.queries).toContain("team_invoice_details");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query team_invoice_details", () => {
      expect(i.queries).toContain("team_invoice_details");
    });

    test("cannot query insert team_invoice_details", () => {
      expect(i.queries).not.toContain("insert_team_invoice_details");
    });

    test("can mutate team_invoice_details", async () => {
      expect(i.mutations).toContain("update_team_invoice_details");
      expect(i.mutations).toContain("update_team_invoice_details_by_pk");
    });

    test("cannot delete team_invoice_details", async () => {
      expect(i.mutations).not.toContain("delete_team_invoice_details");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query team_invoice_details", () => {
      expect(i.queries).toContain("team_invoice_details");
    });

    test("can update team_invoice_details", () => {
      expect(i.mutations).toContain("update_team_invoice_details");
      expect(i.mutations).toContain("update_team_invoice_details_by_pk");
    });

    test("cannot delete team_invoice_details", async () => {
      expect(i.mutations).not.toContain("delete_team_invoice_details");
    });

    test("cannot insert team_invoice_details", async () => {
      expect(i.mutations).not.toContain("insert_team_invoice_details");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query team_invoice_details", () => {
      expect(i.queries).not.toContain("team_invoice_details");
    });

    test("cannot update, delete or insert team_invoice_details", () => {
      expect(i.mutations).not.toContain("update_team_invoice_details");
      expect(i.mutations).not.toContain("update_team_invoice_details_by_pk");
      expect(i.mutations).not.toContain("delete_team_invoice_details");
      expect(i.mutations).not.toContain("insert_team_invoice_details");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query team_invoice_details", () => {
      expect(i.queries).toContain("team_invoice_details");
    });

    test("cannot create, update, or delete team_invoice_details", () => {
      expect(i).toHaveNoMutationsFor("team_invoice_details");
    });
  });
});
