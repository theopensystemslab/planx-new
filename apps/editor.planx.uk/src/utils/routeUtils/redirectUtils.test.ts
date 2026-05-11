import { isSecureLocalRedirect } from "./redirectUtils";

// jsdom sets window.location.origin to "http://localhost"

describe("isSecureLocalRedirect()", () => {
  describe("accepts relative paths", () => {
    it("accepts the root path", () => {
      expect(isSecureLocalRedirect("/")).toBe(true);
    });

    it("accepts valid local paths", () => {
      expect(isSecureLocalRedirect("/app")).toBe(true);
      expect(isSecureLocalRedirect("/app/some-team/some-flow")).toBe(true);
    });

    it("accepts paths with a query string", () => {
      expect(isSecureLocalRedirect("/app?foo=bar")).toBe(true);
    });
  });

  describe("rejects invalid and external URLs", () => {
    it("rejects null", () => {
      expect(isSecureLocalRedirect(null)).toBe(false);
    });

    it("rejects empty string", () => {
      expect(isSecureLocalRedirect("")).toBe(false);
    });

    it("rejects absolute external URLs", () => {
      expect(isSecureLocalRedirect("https://evil.com")).toBe(false);
      expect(isSecureLocalRedirect("http://evil.com")).toBe(false);
      expect(isSecureLocalRedirect("https://evil.com/path")).toBe(false);
    });

    it("rejects protocol URLs (//evil.com)", () => {
      expect(isSecureLocalRedirect("//evil.com")).toBe(false);
    });

    it("rejects javascript: URIs", () => {
      expect(isSecureLocalRedirect("javascript:alert(1)")).toBe(false);
    });
  });
});
