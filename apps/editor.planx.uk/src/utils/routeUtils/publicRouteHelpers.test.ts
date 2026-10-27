import { publicRouteSearchSchemas } from "./publicRouteHelpers";

describe("publicRouteSearchSchemas", () => {
  describe.each(["preview", "draft"] as const)("%s", (route) => {
    it("accepts no search params", () => {
      expect(publicRouteSearchSchemas[route].parse({})).toEqual({});
    });

    it("rejects Save & Return params", () => {
      expect(
        publicRouteSearchSchemas[route].safeParse({ sessionId: "abc123" })
          .success,
      ).toBe(false);
    });
  });
});
