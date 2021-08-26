const { introspectAs } = require("./utils");

describe("sessions and session_events", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query sessions and their associated session events", () => {
      expect(i.queries).toContain("sessions");
      expect(i.queries).not.toContain("session_events");
    });

    test("can create and update sessions & session_events, but not delete them", () => {
      expect(i.mutations).toContain("insert_sessions_one");
      expect(i.mutations).toContain("insert_session_events");
      expect(i.mutations).toContain("update_sessions_by_pk");
      expect(i.mutations).not.toContain("delete_sessions");
      expect(i.mutations).not.toContain("delete_session_events");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can delete sessions and session events", () => {
      expect(i.mutations).toContain("delete_sessions");
      expect(i.mutations).toContain("delete_session_events");
    });
  });
});
