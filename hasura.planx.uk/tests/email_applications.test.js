const { introspectAs } = require("./utils");

describe("email_applications", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query email applications", () => {
      expect(i.queries).not.toContain("email_applications");
    });

    test("cannot create, update, or delete email applications", () => {
      expect(i).toHaveNoMutationsFor("email_applications");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate email applications", () => {
      expect(i.queries).toContain("email_applications");
      expect(i.mutations).toContain("insert_email_applications");
      expect(i.mutations).toContain("insert_email_applications_one");
      expect(i.mutations).toContain("update_email_applications_by_pk");
      expect(i.mutations).toContain("delete_email_applications");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query email_applications", () => {
      expect(i.queries).not.toContain("email_applications");
    });

    test("cannot create, update, or delete email_applications", () => {
      expect(i).toHaveNoMutationsFor("email_applications");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query email_applications", () => {
      expect(i.queries).not.toContain("email_applications");
    });

    test("cannot create, update, or delete email_applications", () => {
      expect(i).toHaveNoMutationsFor("email_applications");
    });
  });
});
