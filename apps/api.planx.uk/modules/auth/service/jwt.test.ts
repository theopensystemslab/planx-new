import { getTestJWT } from "../../../tests/mockJWT.js";
import { getJWTExpiration } from "./jwt.js";

vi.mock("../../../client/index.js", () => ({
  $admin: {},
}));

describe("getJWTExpiration() helper function", () => {
  it("throws for an invalid JWT", () => {
    const invalidJWT = "not a JWT";
    expect(() => getJWTExpiration(invalidJWT)).toThrow(/Failed to decode JWT/);
  });

  it("throws for a JWT without an expiry", () => {
    const jwtWithoutExp = getTestJWT({ role: "teamEditor", isExpired: true });

    expect(() => getJWTExpiration(jwtWithoutExp)).toThrow(
      /Expiry date missing from JWT/,
    );
  });

  it("returns a timestamp on success", () => {
    vi.setSystemTime(new Date("2024-01-01"));

    const validJWT = getTestJWT({ role: "teamEditor" });
    const expiryDate = getJWTExpiration(validJWT);

    // Token expires 24hrs after creation
    expect(expiryDate).toEqual(new Date("2024-01-02"));

    vi.useRealTimers();
  });
});
