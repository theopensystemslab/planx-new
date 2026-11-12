import { introspectAs } from "./utils.js";

describe("downtime_banner", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("can query downtime_banner", () => {
      expect(i.queries).toContain("downtime_banner");
      expect(i.queries).toContain("downtime_banner_by_pk");
    });

    test("cannot create, update, or delete downtime_banner", () => {
      expect(i).toHaveNoMutationsFor("downtime_banner");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query downtime_banner", () => {
      expect(i.queries).toContain("downtime_banner");
      expect(i.queries).toContain("downtime_banner_by_pk");
    });

    test("can update downtime_banner", () => {
      expect(i.mutations).toContain("update_downtime_banner");
      expect(i.mutations).toContain("update_downtime_banner_by_pk");
    });

    test("cannot insert or delete downtime_banner", () => {
      expect(i.mutations).not.toContain("insert_downtime_banner");
      expect(i.mutations).not.toContain("delete_downtime_banner");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("cannot create, update, or delete downtime_banner", () => {
      expect(i).toHaveNoMutationsFor("downtime_banner");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("cannot create, update, or delete downtime_banner", () => {
      expect(i).toHaveNoMutationsFor("downtime_banner");
    });
  });
});
