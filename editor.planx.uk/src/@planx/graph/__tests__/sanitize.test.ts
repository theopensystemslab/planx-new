import { sanitize } from "..";

test("sanitizes string", () => {
  const bad = "<p>Test<img src=x onerror=prompt('Stored XSS')/></p>"
  expect(sanitize(bad)).toEqual(`<p>Test<img src="x"></p>`);
});

test.skip("sanitizes data object values", () => {
  const badData = {
    description: "<p>Test<img src=x onerror=prompt('Stored XSS')/></p>"
  };
  expect(sanitize(badData)).toEqual({ description: `<p>Test<img src="x"></p>` });
});
