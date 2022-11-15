import { locationSearchWithTimeout } from "../gis";

describe("locationSearchWithTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("a successful call", () => {
    const timeout = 500;
    const localAuthority = "braintree";
    const promise = locationSearchWithTimeout(
      localAuthority,
      { x: 50, y: 50, siteBoundary: "[]" },
      timeout
    );
    return expect(promise).resolves.toStrictEqual(expect.any(Object));
  });

  test("an immediate timeout", async () => {
    const timeout = 500;
    const localAuthority = "braintree";
    try {
      await locationSearchWithTimeout(
        localAuthority,
        { x: 50, y: 50, siteBoundary: "[]" },
        timeout
      );
      jest.runAllTimers();
    } catch (e) {
      expect(e).toMatch("location search timeout");
    }
  });
});
