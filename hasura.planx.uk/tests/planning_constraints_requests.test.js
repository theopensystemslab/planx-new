const { introspectAs } = require("./utils");

describe("planning_constraints_requests", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query planning constraints requests", () => {
      expect(i.queries).not.toContain("planning_constraints_requests");
    });

    test("cannot create, update, or delete planning constraints requests", () => {
      expect(i).toHaveNoMutationsFor("planning_constraints_requests");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate planning constraints requests", () => {
      expect(i.queries).toContain("planning_constraints_requests");
      expect(i.mutations).toContain("insert_planning_constraints_requests");
      expect(i.mutations).toContain("update_planning_constraints_requests_by_pk");
      expect(i.mutations).toContain("delete_planning_constraints_requests");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query planning_constraints_requests", () => {
      expect(i.queries).not.toContain("planning_constraints_requests");
    });

    test("cannot create, update, or delete planning_constraints_requests", () => {
      expect(i).toHaveNoMutationsFor("planning_constraints_requests");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query planning_constraints_requests", () => {
      expect(i.queries).not.toContain("planning_constraints_requests");
    });

    test("cannot create, update, or delete planning_constraints_requests", () => {
      expect(i).toHaveNoMutationsFor("planning_constraints_requests");
    });
  });
});
