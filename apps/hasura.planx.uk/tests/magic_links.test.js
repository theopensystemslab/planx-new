const { introspectAs } = require("./utils");

describe("lps_magic_links", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query LPS magic links", () => {
      expect(i.queries).not.toContain("lps_magic_links");
    });

    test("cannot create, update, or delete LPS magic links", () => {
      expect(i).toHaveNoMutationsFor("lps_magic_links");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate LPS magic links", () => {
      expect(i.queries).toContain("lps_magic_links");
      expect(i.mutations).toContain("insert_lps_magic_links");
      expect(i.mutations).toContain(
        "update_lps_magic_links_by_pk"
      );
      expect(i.mutations).toContain("delete_lps_magic_links");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query lps_magic_links", () => {
      expect(i.queries).not.toContain("lps_magic_links");
    });

    test("cannot create, update, or delete lps_magic_links", () => {
      expect(i).toHaveNoMutationsFor("lps_magic_links");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query lps_magic_links", () => {
      expect(i.queries).not.toContain("lps_magic_links");
    });

    test("cannot create, update, or delete lps_magic_links", () => {
      expect(i).toHaveNoMutationsFor("lps_magic_links");
    });
  });

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("cannot query lps_magic_links", () => {
      expect(i.queries).not.toContain("lps_magic_links");
    });

    test("cannot create, update, or delete lps_magic_links", () => {
      expect(i).toHaveNoMutationsFor("lps_magic_links");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query lps_magic_links", () => {
      expect(i.queries).toContain("lps_magic_links");
    });

    test("can insert lps_magic_links", () => {
      expect(i.mutations).toContain("insert_lps_magic_links");
    });

    test("can update  LPS magic links", () => {
      expect(i.mutations).toContain(
        "update_lps_magic_links_by_pk"
      );
    });

    test("cannot delete LPS magic links", () => {
      expect(i.mutations).not.toContain("delete_lps_magic_links");
    });
  });
});
