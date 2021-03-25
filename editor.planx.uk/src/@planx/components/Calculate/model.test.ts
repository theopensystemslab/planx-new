import assert from "assert";

import * as model from "./model";

describe("getVariables", () => {
  const { getVariables } = model;
  test("extracts variables", () => {
    const actual = getVariables("a+1");

    const expected = new Set(["a"]);
    assert(isSetsEqual(actual, expected));
  });

  test("extracts variables with dots", () => {
    const actual = getVariables("a.b+1");

    const expected = new Set(["a.b"]);
    assert(isSetsEqual(actual, expected));
  });

  test("ignores native functions", () => {
    const actual = getVariables("sqrt(a)");

    const expected = new Set(["a"]);
    assert(isSetsEqual(actual, expected));
  });
});

describe("evaluate", () => {
  const { evaluate } = model;
  test("calculates operators and constants", () => {
    const formula = "1+1";
    const scope = {};

    const actual = evaluate(formula, scope);

    const expected = 2;
    assert.strictEqual(actual, expected);
  });

  test("calculates variables", () => {
    const formula = "a+1";
    const scope = { a: 1 };

    const actual = evaluate(formula, scope);

    const expected = 2;
    assert.strictEqual(actual, expected);
  });

  test("interpolates nested variables", () => {
    const actual = evaluate("a.b.c+1", { "a.b.c": 1 });

    const expected = 2;
    assert.strictEqual(actual, expected);
  });

  test("calculates a more complex example", () => {
    const formula =
      "max(round((data.field.with.dots + another.data.field) / data.field.with.dots, 1))";
    const scope = {
      "data.field.with.dots": 10,
      "another.data.field": 5,
      "another.data.field.and.subfield": 12,
    };

    const actual = evaluate(formula, scope);

    const expected = 1.5;
    assert.strictEqual(actual, expected);
  });

  test("defaults to default values", () => {
    const actual = evaluate("a+b+c", { a: 5, c: 5 }, { b: 5 });

    const expected = 15;
    assert.strictEqual(actual, expected);
  });

  test("defaults work with nested variables", () => {
    const actual = evaluate("a.b.c", {}, { "a.b.c": 10 });

    const expected = 10;
    assert.strictEqual(actual, expected);
  });
});

describe("toScope", () => {
  const { toScope } = model;

  test("converts passport to scope", () => {
    const passport = {
      data: {
        "data.field.with.dots": { value: [10] },
        "another.data.field": { value: [5] },
        "another.data.field.and.subfield": { value: [12] },
      },
    };

    const actual = toScope(passport);

    const expected = {
      "data.field.with.dots": 10,
      "another.data.field": 5,
      "another.data.field.and.subfield": 12,
    };
    assert.deepStrictEqual(actual, expected);
  });
});

function isSetsEqual(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every((value) => b.has(value));
}
