const { introspectAs } = require("./utils");

describe("teams", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query teams", () => {
      expect(i.queries).toContain("teams");
    });

    test("cannot create, update, or delete teams", () => {
      expect(i).toHaveNoMutationsFor("teams");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query teams and team members", () => {
      expect(i.queries).toContain("teams");
    });
  });
});
