const { introspectAs } = require("./utils");

describe("application_access_tokens", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query application_access_tokens", () => {
      expect(i.queries).not.toContain("application_access_tokens");
    });

    test("cannot create, update, or delete application_access_tokens", () => {
      expect(i).toHaveNoMutationsFor("application_access_tokens");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate application_access_tokens", async () => {
      expect(i.queries).toContain("application_access_tokens");
      expect(i.mutations).toContain("insert_application_access_tokens");
      expect(i.mutations).toContain("delete_application_access_tokens");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query application_access_tokens", () => {
      expect(i.queries).not.toContain("application_access_tokens");
    });

    test("cannot create, update, or delete application_access_tokens", () => {
      expect(i).toHaveNoMutationsFor("application_access_tokens");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query application_access_tokens", () => {
      expect(i.queries).not.toContain("application_access_tokens");
    });

    test("cannot create, update, or delete application_access_tokens", () => {
      expect(i).toHaveNoMutationsFor("application_access_tokens");
    });
  });

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("cannot query application_access_tokens", () => {
      expect(i.queries).not.toContain("application_access_tokens");
    });

    test("cannot create, update, or delete application_access_tokens", () => {
      expect(i).toHaveNoMutationsFor("application_access_tokens");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query application_access_tokens", () => {
      expect(i.queries).toContain("application_access_tokens");
    });

    test("can insert application_access_tokens", () => {
      expect(i.mutations).toContain("insert_application_access_tokens");
    });

    test("can insert application_access_tokens", () => {
      expect(i.mutations).toContain("update_application_access_tokens");
    });

    test("cannot delete  application_access_tokens", () => {
      expect(i.mutations).not.toContain("delete_application_access_tokens");
    });
  });
});
