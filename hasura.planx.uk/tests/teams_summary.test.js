const { introspectAs } = require("./utils");

describe("teams_summary", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query teams_summary", () => {
      expect(i.queries).not.toContain("teams_summary");
    });

    test("cannot create, update, or delete teams_summary", () => {
      expect(i).toHaveNoMutationsFor("teams_summary");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query teams_summary and team members", () => {
      expect(i.queries).toContain("teams_summary");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query teams_summary", () => {
      expect(i.queries).toContain("teams_summary");
    });

    test("cannot create, update, or delete teams_summary", () => {
      expect(i).toHaveNoMutationsFor("teams_summary");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query teams_summary", () => {
      expect(i.queries).not.toContain("teams_summary");
    });

    test("cannot create, update, or delete teams_summary", () => {
      expect(i).toHaveNoMutationsFor("teams_summary");
    });
  });

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("cannot query teams_summary", () => {
      expect(i.queries).not.toContain("teams_summary");
    });

    test("cannot create, update, or delete teams_summary", () => {
      expect(i).toHaveNoMutationsFor("teams_summary");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query teams_summary", () => {
      expect(i.queries).not.toContain("teams_summary");
    });

    test("cannot create, update, or delete teams_summary", () => {
      expect(i).toHaveNoMutationsFor("teams_summary");
    });
  });

  describe("analyst", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("analyst");
    });

    test("can query teams_summary", () => {
      expect(i.queries).toContain("teams_summary");
    });

    test("cannot create, update, or delete teams_summary", () => {
      expect(i).toHaveNoMutationsFor("teams_summary");
    });
  });
});
