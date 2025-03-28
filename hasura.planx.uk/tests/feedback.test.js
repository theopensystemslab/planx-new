const { introspectAs } = require("./utils");

describe("feedback", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query feedback", () => {
      expect(i.queries).not.toContain("feedback");
    });

    test("cannot update feedback", () => {
      expect(i.mutations).not.toContain("update_feedback");
      expect(i.mutations).not.toContain("update_feedback_by_pk");
    });

    test("cannot delete feedback", async () => {
      expect(i.mutations).not.toContain("delete_feedback");
    });

    test("can insert feedback", async () => {
      expect(i.mutations).toContain("insert_feedback");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate feedback", () => {
      expect(i.mutations).toContain("insert_feedback");
      expect(i.mutations).toContain("insert_feedback_one");
      expect(i.mutations).toContain("update_feedback");
      expect(i.mutations).toContain("update_feedback_by_pk");
      expect(i.mutations).toContain("update_feedback_many");
      expect(i.mutations).toContain("delete_feedback");
      expect(i.mutations).toContain("delete_feedback_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query feedback", () => {
      expect(i.queries).toContain("feedback");
    });

    test("cannot insert feedback", async () => {
      expect(i.mutations).not.toContain("insert_feedback");
      expect(i.mutations).not.toContain("insert_feedback_one");
    });

    test("cannot delete feedback", async () => {
      expect(i.mutations).not.toContain("delete_feedback");
      expect(i.mutations).not.toContain("delete_feedback_by_pk");
    });

    test("can update feedback", async () => {
      expect(i.mutations).toContain("update_feedback");
      expect(i.mutations).toContain("update_feedback_by_pk");
      expect(i.mutations).toContain("update_feedback_many");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query feedback", () => {
      expect(i.queries).toContain("feedback");
    });

    test("cannot insert feedback", async () => {
      expect(i.mutations).not.toContain("insert_feedback");
      expect(i.mutations).not.toContain("insert_feedback_one");
    });

    test("cannot delete feedback", async () => {
      expect(i.mutations).not.toContain("delete_feedback");
      expect(i.mutations).not.toContain("delete_feedback_by_pk");
    });

    test("can update feedback", async () => {
      expect(i.mutations).toContain("update_feedback");
      expect(i.mutations).toContain("update_feedback_by_pk");
      expect(i.mutations).toContain("update_feedback_many");
    });
  });

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("cannot query feedback", () => {
      expect(i.queries).not.toContain("feedback");
    });

    test("cannot mutate feedback", async () => {
      expect(i).toHaveNoMutationsFor("feedback");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query feedback", () => {
      expect(i.queries).toContain("feedback");
    });

    test("cannot update feedback", () => {
      expect(i.mutations).not.toContain("update_feedback");
      expect(i.mutations).not.toContain("update_feedback_by_pk");
    });

    test("can delete feedback", async () => {
      expect(i.mutations).toContain("delete_feedback");
    });

    test("cannot insert feedback", async () => {
      expect(i.mutations).not.toContain("insert_feedback");
    });
  });
});
