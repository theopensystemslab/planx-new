import { introspectAs } from "./utils.js";

describe("team trial history", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query team_trial_history", () => {
      expect(i.queries).not.toContain("team_trial_history");
    });

    test("cannot create, update, or delete team_trial_history", () => {
      expect(i).toHaveNoMutationsFor("team_trial_history");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("has full access to team_trial_history", () => {
      expect(i.queries).toContain("team_trial_history");
      expect(i.mutations).toContain("insert_team_trial_history");
      expect(i.mutations).toContain("insert_team_trial_history_one");
      expect(i.mutations).toContain("update_team_trial_history_by_pk");
      expect(i.mutations).toContain("delete_team_trial_history");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query team_trial_history", () => {
      expect(i.queries).toContain("team_trial_history");
    });

    test("cannot create, update, or delete team_trial_history", () => {
      expect(i).toHaveNoMutationsFor("team_trial_history");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query team_trial_history", () => {
      expect(i.queries).toContain("team_trial_history");
    });

    test("cannot create, update, or delete team_trial_history", () => {
      expect(i).toHaveNoMutationsFor("team_trial_history");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("can query team_trial_history", () => {
      expect(i.queries).toContain("team_trial_history");
    });

    test("cannot create, update, or delete team_trial_history", () => {
      expect(i).toHaveNoMutationsFor("team_trial_history");
    });
  });

  describe("analyst", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("analyst");
    });

    test("can query team_trial_history", () => {
      expect(i.queries).toContain("team_trial_history");
    });

    test("cannot create, update, or delete team_trial_history", () => {
      expect(i).toHaveNoMutationsFor("team_trial_history");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query team_trial_history", () => {
      expect(i.queries).not.toContain("team_trial_history");
    });

    test("cannot create, update, or delete team_trial_history", () => {
      expect(i).toHaveNoMutationsFor("team_trial_history");
    });
  });
});
