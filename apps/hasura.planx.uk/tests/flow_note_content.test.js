import { introspectAs } from "./utils.js";

describe("flow note content", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query flow_note_content", () => {
      expect(i.queries).not.toContain("flow_note_content");
    });

    test("cannot create, update, or delete flow_note_content", () => {
      expect(i).toHaveNoMutationsFor("flow_note_content");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query flow_note_content", () => {
      expect(i.queries).toContain("flow_note_content");
    });

    test("can create flow_note_content", () => {
      expect(i.mutations).toContain("insert_flow_note_content");
    });

    test("can update flow_note_content", () => {
      expect(i.mutations).toContain("update_flow_note_content");
      expect(i.mutations).toContain("update_flow_note_content_by_pk");
    });

    // TODO remove permissions once soft delete pattern implemented
    test("can delete flow_note_content", () => {
      expect(i.mutations).toContain("delete_flow_note_content");
      expect(i.mutations).toContain("delete_flow_note_content_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query flow_note_content", () => {
      expect(i.queries).toContain("flow_note_content");
    });

    test("can create flow_note_content", () => {
      expect(i.mutations).toContain("insert_flow_note_content");
    });

    test("can update flow_note_content", () => {
      expect(i.mutations).toContain("update_flow_note_content");
      expect(i.mutations).toContain("update_flow_note_content_by_pk");
    });

    // TODO remove permissions once soft delete pattern implemented
    test("can delete flow_note_content", () => {
      expect(i.mutations).toContain("delete_flow_note_content");
      expect(i.mutations).toContain("delete_flow_note_content_by_pk");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query flow_note_content", () => {
      expect(i.queries).toContain("flow_note_content");
    });

    test("can create flow_note_content", () => {
      expect(i.mutations).toContain("insert_flow_note_content");
    });

    test("can update flow_note_content", () => {
      expect(i.mutations).toContain("update_flow_note_content");
      expect(i.mutations).toContain("update_flow_note_content_by_pk");
    });

    // TODO remove permissions once soft delete pattern implemented
    test("can delete flow_note_content", () => {
      expect(i.mutations).toContain("delete_flow_note_content");
      expect(i.mutations).toContain("delete_flow_note_content_by_pk");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("can query flow_note_content", () => {
      expect(i.queries).toContain("flow_note_content");
    });

    test("can create flow_note_content", () => {
      expect(i.mutations).toContain("insert_flow_note_content");
    });

    test("can update flow_note_content", () => {
      expect(i.mutations).toContain("update_flow_note_content");
      expect(i.mutations).toContain("update_flow_note_content_by_pk");
    });

    // TODO remove permissions once soft delete pattern implemented
    test("can delete flow_note_content", () => {
      expect(i.mutations).toContain("delete_flow_note_content");
      expect(i.mutations).toContain("delete_flow_note_content_by_pk");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query flow_note_content", () => {
      expect(i.queries).not.toContain("flow_note_content");
    });

    test("cannot create, update, or delete flow_note_content", () => {
      expect(i).toHaveNoMutationsFor("flow_note_content");
    });
  });
});
