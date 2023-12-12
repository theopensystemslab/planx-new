import { isEqual } from "./middleware";

describe("isEqual() helper function", () => {
  it("handles undefined secrets", () => {
    const req = { headers: { "api-key": undefined } };
    const result = isEqual(req.headers["api-key"], process.env.UNSET_SECRET!);
    expect(result).toBe(false);
  });

  it("handles null values", () => {
    const req = { headers: { "api-key": null } };
    // @ts-expect-error "api-key" purposefully set to wrong type
    const result = isEqual(req.headers["api-key"], null!);
    expect(result).toBe(false);
  });

  it("handles undefined headers", () => {
    const req = { headers: { "some-other-header": "test123" } };
    // @ts-expect-error "api-key" purposefully not set
    const result = isEqual(req.headers["api-key"]!, process.env.UNSET_SECRET!);
    expect(result).toBe(false);
  });

  it("handles empty strings", () => {
    const req = { headers: { "api-key": "" } };
    expect(isEqual(req.headers["api-key"], "")).toBe(false);
  });

  it("matches equal values", () => {
    expect(isEqual("square", "square")).toBe(true);
  });

  it("does not match different values", () => {
    expect(isEqual("circle", "triangle")).toBe(false);
  });
});
