const { introspectAs } = require("./utils");

describe("bops_applications", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query bops applications", () => {
      expect(i.queries).not.toContain("bops_applications");
    });

    test("cannot create, update, or delete bops applications", () => {
      expect(i).toHaveNoMutationsFor("bops_applications");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate bops applications", () => {
      expect(i.queries).toContain("bops_applications");
      expect(i.mutations).toContain("insert_bops_applications");
      expect(i.mutations).toContain("update_bops_applications_by_pk");
      expect(i.mutations).toContain("delete_bops_applications");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query bops_applications", () => {
      expect(i.queries).not.toContain("bops_applications");
    });

    test("cannot create, update, or delete bops_applications", () => {
      expect(i).toHaveNoMutationsFor("bops_applications");
    });
  });
});
