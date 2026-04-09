const { introspectAs } = require("./utils");

describe("submission_emails", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query teams", () => {
      expect(i.queries).toContain("submission_emails");
    });

    test("cannot create, update, or delete flow integrations", () => {
      expect(i).toHaveNoMutationsFor("submission_emails");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query flow integrations", () => {
      expect(i.queries).toContain("submission_emails");
    });

    test("has full access to query and mutate flow integrations", async () => {
      expect(i.queries).toContain("submission_emails");

      expect(i.mutations).toContain("insert_submission_emails");
      expect(i.mutations).toContain("update_submission_emails_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query flow integrations", () => {
      expect(i.queries).toContain("submission_emails");
    });

    test("has full access to query and mutate flow integrations", async () => {
      expect(i.queries).toContain("submission_emails");

      expect(i.mutations).toContain("insert_submission_emails");
      expect(i.mutations).toContain("update_submission_emails_by_pk");
    });

    test("can delete flow integrations", async () => {
      expect(i.mutations).toContain("delete_submission_emails");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query flow integrations", () => {
      expect(i.queries).toContain("submission_emails");
    });

    test("can update flow integrations", () => {
      expect(i.mutations).toContain("update_submission_emails");
      expect(i.mutations).toContain("update_submission_emails_by_pk");
    });

    test("can delete flow integrations", async () => {
      expect(i.mutations).toContain("delete_submission_emails");
    });

    test("can add flow integrations", async () => {
      expect(i.mutations).toContain("insert_submission_emails");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query submission integrations", () => {
      expect(i.queries).toContain("submission_emails");
    });

    test("cannot update submission integrations", () => {
      expect(i.mutations).not.toContain("update_submission_emails");
      expect(i.mutations).not.toContain("update_submission_emails_by_pk");
      expect(i.mutations).not.toContain("update_submission_emails_many");
    });

    test("cannot create or delete flow integrations", () => {
      expect(i.mutations).not.toContain("insert_submission_emails");
      expect(i.mutations).not.toContain("delete_submission_emails");
    });
  });

  describe("analyst", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("analyst");
    });

    test("cannot query flow integrations", () => {
      expect(i.queries).not.toContain("submission_emails");
    });

    test("cannot update flow integrations", () => {
      expect(i.mutations).not.toContain("update_submission_emails");
      expect(i.mutations).not.toContain("update_submission_emails_by_pk");
      expect(i.mutations).not.toContain("update_submission_emails_many");
    });

    test("cannot create or delete flow integrations", () => {
      expect(i.mutations).not.toContain("insert_submission_emails");
      expect(i.mutations).not.toContain("delete_submission_emails");
    });
  });
});
