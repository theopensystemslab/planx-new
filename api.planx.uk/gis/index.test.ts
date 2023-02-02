import { locationSearchWithTimeout } from "../gis";

describe("locationSearchWithTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test.skip("a successful call", async () => {
    const timeout = 500;
    const localAuthority = "braintree";
    const promise = locationSearchWithTimeout(
      localAuthority,
      { x: 50, y: 50, siteBoundary: "[]" },
      timeout
    );
    await expect(promise).resolves.toStrictEqual(expect.any(Object));
  });

  test.skip("an immediate timeout", async () => {
    const timeout = 500;
    const localAuthority = "braintree";
    const promise = locationSearchWithTimeout(
      localAuthority,
      { x: 50, y: 50, siteBoundary: "[]" },
      timeout
    );
    jest.runAllTimers();
    await expect(promise).rejects.toEqual("location search timeout");
  });
});
