import { introspectAs } from "./utils.js";

describe("flow notes", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query flow_notes", () => {
      expect(i.queries).not.toContain("flow_notes");
    });

    test("cannot create, update, or delete flow_notes", () => {
      expect(i).toHaveNoMutationsFor("flow_notes");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query flow_notes", () => {
      expect(i.queries).toContain("flow_notes");
    });

    test("can create flow_notes", () => {
      expect(i.mutations).toContain("insert_flow_notes");
    });

    test("can update flow_notes", () => {
      expect(i.mutations).toContain("update_flow_notes");
      expect(i.mutations).toContain("update_flow_notes_by_pk");
    });

    test("can delete flow_notes", () => {
      expect(i.mutations).toContain("delete_flow_notes");
      expect(i.mutations).toContain("delete_flow_notes_by_pk");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query flow_notes", () => {
      expect(i.queries).toContain("flow_notes");
    });

    test("can create flow_notes", () => {
      expect(i.mutations).toContain("insert_flow_notes");
    });

    test("can update flow_notes", () => {
      expect(i.mutations).toContain("update_flow_notes");
      expect(i.mutations).toContain("update_flow_notes_by_pk");
    });

    test("can delete flow_notes", () => {
      expect(i.mutations).toContain("delete_flow_notes");
      expect(i.mutations).toContain("delete_flow_notes_by_pk");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query flow_notes", () => {
      expect(i.queries).toContain("flow_notes");
    });

    test("can create flow_notes", () => {
      expect(i.mutations).toContain("insert_flow_notes");
    });

    test("can update flow_notes", () => {
      expect(i.mutations).toContain("update_flow_notes");
      expect(i.mutations).toContain("update_flow_notes_by_pk");
    });

    test("can delete flow_notes", () => {
      expect(i.mutations).toContain("delete_flow_notes");
      expect(i.mutations).toContain("delete_flow_notes_by_pk");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("can query flow_notes", () => {
      expect(i.queries).toContain("flow_notes");
    });

    test("can create flow_notes", () => {
      expect(i.mutations).toContain("insert_flow_notes");
    });

    test("can update flow_notes", () => {
      expect(i.mutations).toContain("update_flow_notes");
      expect(i.mutations).toContain("update_flow_notes_by_pk");
    });

    test("can delete flow_notes", () => {
      expect(i.mutations).toContain("delete_flow_notes");
      expect(i.mutations).toContain("delete_flow_notes_by_pk");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query flow_notes", () => {
      expect(i.queries).not.toContain("flow_notes");
    });

    test("cannot create, update, or delete flow_notes", () => {
      expect(i).toHaveNoMutationsFor("flow_notes");
    });
  });
});
