const { introspectAs } = require("./utils");

describe("uniform_applications", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query uniform applications", () => {
      expect(i.queries).not.toContain("uniform_applications");
    });

    test("cannot create, update, or delete uniform applications", () => {
      expect(i).toHaveNoMutationsFor("uniform_applications");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate uniform applications", () => {
      expect(i.queries).toContain("uniform_applications");
      expect(i.mutations).toContain("insert_uniform_applications");
      expect(i.mutations).toContain("update_uniform_applications_by_pk");
      expect(i.mutations).toContain("delete_uniform_applications");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query uniform_applications", () => {
      expect(i.queries).not.toContain("uniform_applications");
    });

    test("cannot create, update, or delete uniform_applications", () => {
      expect(i).toHaveNoMutationsFor("uniform_applications");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query uniform_applications", () => {
      expect(i.queries).not.toContain("uniform_applications");
    });

    test("cannot create, update, or delete uniform_applications", () => {
      expect(i).toHaveNoMutationsFor("uniform_applications");
    });
  });

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("cannot query uniform applications", () => {
      expect(i.queries).not.toContain("uniform_applications");
    });

    test("cannot create, update, or delete uniform applications", () => {
      expect(i).toHaveNoMutationsFor("uniform_applications");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("has full access to query and mutate uniform applications", () => {
      expect(i.queries).toContain("uniform_applications");
      expect(i.mutations).toContain("insert_uniform_applications");
      expect(i.mutations).toContain("update_uniform_applications_by_pk");
    });

    test("cannot delete uniform applications", () => {
      expect(i.mutations).not.toContain("delete_uniform_applications");
    });
  });
});
