import { introspectAs } from "./utils.js";

describe("search_flows", () => {
  describe("permissions", () => {
    test.each([
      "teamEditor",
      "teamAdmin",
      "platformAdmin",
      "public",
      "analyst",
      "api",
    ])("%s role can call search_flows as a query", async (role) => {
      const i = await introspectAs(role);
      expect(i.queries).toContain("search_flows");
    });

    test.each(["teamViewer"])(
      "%s role cannot call search_flows",
      async (role) => {
        const i = await introspectAs(role);
        expect(i.queries).not.toContain("search_flows");
      },
    );
  });
});
