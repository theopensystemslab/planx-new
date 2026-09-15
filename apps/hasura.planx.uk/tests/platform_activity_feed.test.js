import { introspectAs } from "./utils.js";

describe("platform_activity_feed", () => {
  describe("public", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("public");
    });

    test("cannot query platform_activity_feed", () => {
      expect(i.queries).not.toContain("platform_activity_feed");
    });

    test("cannot create, update, or delete platform_activity_feed", () => {
      expect(i).toHaveNoMutationsFor("platform_activity_feed");
    });
  });

  describe("admin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("admin");
    });

    test("can query platform_activity_feed", () => {
      expect(i.queries).toContain("platform_activity_feed");
    });
  });

  describe("platformAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("platformAdmin");
    });

    test("can query platform_activity_feed", () => {
      expect(i.queries).toContain("platform_activity_feed");
    });

    test("cannot create, update, or delete platform_activity_feed", () => {
      expect(i).toHaveNoMutationsFor("platform_activity_feed");
    });
  });

  describe("teamEditor", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamEditor");
    });

    test("can query platform_activity_feed", () => {
      expect(i.queries).toContain("platform_activity_feed");
    });

    test("cannot create, update, or delete platform_activity_feed", () => {
      expect(i).toHaveNoMutationsFor("platform_activity_feed");
    });
  });

  describe("teamAdmin", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamAdmin");
    });

    test("can query platform_activity_feed", () => {
      expect(i.queries).toContain("platform_activity_feed");
    });

    test("cannot create, update, or delete platform_activity_feed", () => {
      expect(i).toHaveNoMutationsFor("platform_activity_feed");
    });
  });

  describe("api", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("api");
    });

    test("cannot query platform_activity_feed", () => {
      expect(i.queries).not.toContain("platform_activity_feed");
    });

    test("cannot create, update, or delete platform_activity_feed", () => {
      expect(i).toHaveNoMutationsFor("platform_activity_feed");
    });
  });

  describe("analyst", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("analyst");
    });

    test("can query platform_activity_feed", () => {
      expect(i.queries).toContain("platform_activity_feed");
    });

    test("cannot create, update, or delete platform_activity_feed", () => {
      expect(i).toHaveNoMutationsFor("platform_activity_feed");
    });
  });

  describe("teamViewer", () => {
    let i;
    beforeAll(async () => {
      i = await introspectAs("teamViewer");
    });

    test("can query platform_activity_feed", () => {
      expect(i.queries).toContain("platform_activity_feed");
    });

    test("cannot create, update, or delete platform_activity_feed", () => {
      expect(i).toHaveNoMutationsFor("platform_activity_feed");
    });
  });
});
