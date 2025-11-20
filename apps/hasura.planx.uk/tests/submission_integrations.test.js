const { introspectAs } = require("./utils");

describe("submission_integrations", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query teams", () => {
      expect(i.queries).toContain("submission_integrations");
    });

    test("cannot create, update, or delete flow integrations", () => {
      expect(i).toHaveNoMutationsFor("submission_integrations");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query flow integrations", () => {
      expect(i.queries).toContain("submission_integrations");
    });

    test("has full access to query and mutate flow integrations", async () => {
      expect(i.queries).toContain("submission_integrations");

      expect(i.mutations).toContain("insert_submission_integrations");
      expect(i.mutations).toContain("update_submission_integrations_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query flow integrations", () => {
      expect(i.queries).toContain("submission_integrations");
    });

    test("has full access to query and mutate flow integrations", async () => {
      expect(i.queries).toContain("submission_integrations");

      expect(i.mutations).toContain("insert_submission_integrations");
      expect(i.mutations).toContain("update_submission_integrations_by_pk");
    });

    test("can delete flow integrations", async () => {
      expect(i.mutations).toContain("delete_submission_integrations");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query flow integrations", () => {
      expect(i.queries).toContain("submission_integrations");
    });

    test("can update flow integrations", () => {
      expect(i.mutations).toContain("update_submission_integrations");
      expect(i.mutations).toContain("update_submission_integrations_by_pk");
    });

    test("can delete flow integrations", async () => {
      expect(i.mutations).toContain("delete_submission_integrations");
    });

    test("can add flow integrations", async () => {
      expect(i.mutations).toContain("insert_submission_integrations");
    });
  });

  describe("demoUser", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("demoUser");
    });

    test("cannot query flow integrations", () => {
      expect(i.queries).not.toContain("submission_integrations");
    });

    test("cannot create, update, or delete flow integrations", () => {
      expect(i).toHaveNoMutationsFor("submission_integrations");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query submission integrations", () => {
      expect(i.queries).toContain("submission_integrations");
    });

    test("cannot update submission integrations", () => {
      expect(i.mutations).not.toContain("update_submission_integrations");
      expect(i.mutations).not.toContain("update_submission_integrations_by_pk");
      expect(i.mutations).not.toContain("update_submission_integrations_many");
    });

    test("cannot create or delete flow integrations", () => {
      expect(i.mutations).not.toContain("insert_submission_integrations");
      expect(i.mutations).not.toContain("delete_submission_integrations");
    });
  });

  describe("analyst", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("analyst");
    });

    test("cannot query flow integrations", () => {
      expect(i.queries).not.toContain("submission_integrations");
    });

    test("cannot update flow integrations", () => {
      expect(i.mutations).not.toContain("update_submission_integrations");
      expect(i.mutations).not.toContain("update_submission_integrations_by_pk");
      expect(i.mutations).not.toContain("update_submission_integrations_many");
    });

    test("cannot create or delete flow integrations", () => {
      expect(i.mutations).not.toContain("insert_submission_integrations");
      expect(i.mutations).not.toContain("delete_submission_integrations");
    });
  });
});
