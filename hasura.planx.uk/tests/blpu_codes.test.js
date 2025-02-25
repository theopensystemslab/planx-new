const { introspectAs } = require("./utils");

describe("blpu_codes", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query blpu_codes", () => {
      expect(i.queries).toContain("blpu_codes");
    });

    test("cannot create, update, or delete blpu_codes", () => {
      expect(i).toHaveNoMutationsFor("blpu_codes");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate blpu_codes", () => {
      expect(i.queries).toContain("blpu_codes");
      expect(i.mutations).toContain("insert_blpu_codes");
      expect(i.mutations).toContain("update_blpu_codes_by_pk");
      expect(i.mutations).toContain("delete_blpu_codes");
    });
  });
  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query blpu_codes", () => {
      expect(i.queries).not.toContain("blpu_codes");
    });

    test("cannot create, update, or delete blpu_codes", () => {
      expect(i).toHaveNoMutationsFor("blpu_codes");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query blpu_codes", () => {
      expect(i.queries).not.toContain("blpu_codes");
    });

    test("cannot create, update, or delete blpu_codes", () => {
      expect(i).toHaveNoMutationsFor("blpu_codes");
    });
  });

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("can query blpu_codes", () => {
      expect(i.queries).not.toContain("blpu_codes");
    });

    test("cannot create, update, or delete blpu_codes", () => {
      expect(i).toHaveNoMutationsFor("blpu_codes");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query blpu_codes", () => {
      expect(i.queries).not.toContain("blpu_codes");
    });

    test("cannot create, update, or delete blpu_codes", () => {
      expect(i).toHaveNoMutationsFor("blpu_codes");
    });
  });
});
