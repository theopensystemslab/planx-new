const { introspectAs } = require("./utils");

describe("notifications", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query notifications", () => {
      expect(i.queries).not.toContain("notifications");
    });

    test("cannot create, update, or delete notifications", () => {
      expect(i).toHaveNoMutationsFor("notifications");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate notifications", () => {
      expect(i.queries).toContain("notifications");
      expect(i.mutations).toContain("insert_notifications");
      expect(i.mutations).toContain(
        "update_notifications_by_pk"
      );
      expect(i.mutations).toContain("delete_notifications");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query notifications", () => {
      expect(i.queries).not.toContain("notifications");
    });

    test("cannot create, update, or delete notifications", () => {
      expect(i).toHaveNoMutationsFor("notifications");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query notifications", () => {
      expect(i.queries).not.toContain("notifications");
    });

    test("cannot create, update, or delete notifications", () => {
      expect(i).toHaveNoMutationsFor("notifications");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("can query notifications", () => {
      expect(i.queries).toContain("notifications");
    });

    test("can insert notifications", () => {
      expect(i.mutations).toContain("insert_notifications");
    });

    test("can update  notifications", () => {
      expect(i.mutations).toContain(
        "update_notifications_by_pk"
      );
    });

    test("cannot delete notifications", () => {
      expect(i.mutations).not.toContain("delete_notifications");
    });
  });
});
