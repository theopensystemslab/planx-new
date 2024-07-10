const { introspectAs } = require("./utils");

describe("s3_applications", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query s3 applications", () => {
      expect(i.queries).not.toContain("s3_applications");
    });

    test("cannot create, update, or delete s3 applications", () => {
      expect(i).toHaveNoMutationsFor("s3_applications");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate s3 applications", () => {
      expect(i.queries).toContain("s3_applications");
      expect(i.mutations).toContain("insert_s3_applications");
      expect(i.mutations).toContain("update_s3_applications_by_pk");
      expect(i.mutations).toContain("delete_s3_applications");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query s3_applications", () => {
      expect(i.queries).not.toContain("s3_applications");
    });

    test("cannot create, update, or delete s3_applications", () => {
      expect(i).toHaveNoMutationsFor("s3_applications");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query s3_applications", () => {
      expect(i.queries).not.toContain("s3_applications");
    });

    test("cannot create, update, or delete s3_applications", () => {
      expect(i).toHaveNoMutationsFor("s3_applications");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query and mutate s3 applications", () => {
      expect(i.queries).toContain("s3_applications");
      expect(i.mutations).toContain("insert_s3_applications");
      expect(i.mutations).toContain("update_s3_applications_by_pk");
    });

    test("cannot delete s3 applications", () => {
      expect(i.mutations).not.toContain("delete_s3_applications");
    });
  });
});
