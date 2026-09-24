import { introspectAs } from "./utils.js";

describe("team_category_enum", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot INSERT records", () => {
      expect(i.mutations).not.toContain("insert_team_category_enum");
    });

    test("cannot QUERY records", () => {
      expect(i.queries).not.toContain("team_category_enum");
    });

    test("cannot DELETE records", () => {
      expect(i.mutations).not.toContain("delete_team_category_enum");
    });

    test("cannot UPDATE records", () => {
      expect(i.mutations).not.toContain("update_team_category_enum");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to query and mutate team_category_enum", async () => {
      expect(i.queries).toContain("team_category_enum");
      expect(i.mutations).toContain("insert_team_category_enum");
      expect(i.mutations).toContain("delete_team_category_enum");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("cannot query team_category_enum", () => {
      expect(i.queries).not.toContain("team_category_enum");
    });

    test("cannot create, update, or delete team_category_enum", () => {
      expect(i).toHaveNoMutationsFor("team_category_enum");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot query team_category_enum", () => {
      expect(i.queries).not.toContain("team_category_enum");
    });

    test("cannot create, update, or delete team_category_enum", () => {
      expect(i).toHaveNoMutationsFor("team_category_enum");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot query team_category_enum", () => {
      expect(i.queries).not.toContain("team_category_enum");
    });

    test("cannot create, update, or delete team_category_enum", () => {
      expect(i).toHaveNoMutationsFor("team_category_enum");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query team_category_enum", () => {
      expect(i.queries).not.toContain("team_category_enum");
    });

    test("cannot create, update, or delete team_category_enum", () => {
      expect(i.mutations).not.toContain("insert_team_category_enum");
      expect(i.mutations).not.toContain("update_team_category_enum");
      expect(i.mutations).not.toContain("delete_team_category_enum");
    });
  });
});
