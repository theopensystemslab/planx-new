const { introspectAs } = require("./utils");

describe("global_settings", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query global_settings view", () => {
      expect(i.queries).toContain("global_settings");
    });

    test("cannot create, update, or delete global_settings", () => {
      expect(i).toHaveNoMutationsFor("global_settings");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate global_settings", async () => {
      expect(i.queries).toContain("global_settings");

      expect(i.mutations).toContain("insert_global_settings");
      expect(i.mutations).toContain("update_global_settings_by_pk");
      expect(i.mutations).toContain("delete_global_settings");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("has full access to query and mutate global_settings", async () => {
      expect(i.queries).toContain("global_settings");

      expect(i.mutations).toContain("insert_global_settings");
      expect(i.mutations).toContain("update_global_settings_by_pk");
    });

    test("cannot delete global_settings", async () => {
      expect(i.mutations).not.toContain("delete_global_settings");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("can query global_settings view", () => {
      expect(i.queries).toContain("global_settings");
    });

    test("cannot create, update, or delete global_settings", () => {
      expect(i).toHaveNoMutationsFor("global_settings");
    });
  });
});
