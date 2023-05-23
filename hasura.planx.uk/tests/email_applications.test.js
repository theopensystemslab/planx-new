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

    test("has full access to query and mutate email appliations", () => {
      expect(i.queries).toContain("email_applications");
      expect(i.mutations).toContain("insert_email_applications");
      expect(i.mutations).toContain("insert_email_applications_one");
      expect(i.mutations).toContain("update_email_applications_by_pk");
      expect(i.mutations).toContain("delete_email_applications");
    });
  });
});
