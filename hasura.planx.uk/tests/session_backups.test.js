const { introspectAs } = require("./utils");

describe("session_backups", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can INSERT records", () => {
      expect(i.mutations).toContain("insert_session_backups");
      expect(i.mutations).toContain("insert_session_backups_one"); // this is the mutation we use
    });

    test("can QUERY records", () => {
      expect(i.queries).toContain("session_backups"); // "permissions" limit to 1 row only and only "id" column
    });

    test("cannot DELETE records", () => {
      expect(i.mutations).not.toContain("delete_session_backups");
      expect(i.mutations).not.toContain("delete_session_backups_by_pk");
    });

    test("cannot UPDATE records", () => {
      expect(i.mutations).not.toContain("update_session_backups");
      expect(i.mutations).not.toContain("update_session_backups_by_pk");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate session_backups", async () => {
      expect(i.queries).toContain("session_backups");
      expect(i.mutations).toContain("insert_session_backups");
      expect(i.mutations).toContain("update_session_backups_by_pk");
      expect(i.mutations).toContain("delete_session_backups");
    });
  });
});
