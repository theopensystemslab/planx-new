import * as model from "./model";

describe("getVariables", () => {
  const { getVariables } = model;
  test("extracts variables", () => {
    const actual = getVariables("a+1");

    const expected = new Set(["a"]);
    expect(isSetsEqual(actual, expected)).toBe(true);
  });

  test("extracts variables with dots", () => {
    const actual = getVariables("a.b+1");

    const expected = new Set(["a.b"]);
    expect(isSetsEqual(actual, expected)).toBe(true);
  });

  test("ignores native functions", () => {
    const actual = getVariables("sqrt(a)");

    const expected = new Set(["a"]);
    expect(isSetsEqual(actual, expected)).toBe(true);
  });
});

describe("evaluate", () => {
  const { evaluate } = model;
  test("calculates operators and constants", () => {
    const formula = "1+1";
    const scope = {};

    const actual = evaluate(formula, scope);

    const expected = 2;
    expect(expected).toEqual(actual);
  });

  test("calculates variables", () => {
    const formula = "a+1";
    const scope = { a: 1 };

    const actual = evaluate(formula, scope);

    const expected = 2;
    expect(expected).toEqual(actual);
  });

  test("interpolates nested variables", () => {
    const actual = evaluate("a.b.c+1", { "a.b.c": 1 });

    const expected = 2;
    expect(expected).toEqual(actual);
  });

  test("works with data fields that have underscore in the name", () => {
    const actual = evaluate("a.b_c.d+1", { "a.b_c.d": 1 });

    const expected = 2;
    expect(expected).toEqual(actual);
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
    expect(expected).toEqual(actual);
  });

  test("defaults to default values", () => {
    const actual = evaluate("a+b+c", { a: 5, c: 5 }, { b: 5 });

    const expected = 15;
    expect(expected).toEqual(actual);
  });

  test("defaults work with nested variables", () => {
    const actual = evaluate("a.b.c", {}, { "a.b.c": 10 });

    const expected = 10;
    expect(expected).toEqual(actual);
  });
});

function isSetsEqual(a: Set<string>, b: Set<string>) {
  return a.size === b.size && [...a].every((value) => b.has(value));
}
