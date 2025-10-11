/**
 * returns a cloned object excluding any shallow values such as undefined, null or ""
 * @example
 * // returns { a: 1, e: { foo: null } }
 * objectWithoutNullishValues({ a: 1, b: undefined, c: null, d: "", e: { foo: null } })
 */
export const objectWithoutNullishValues = (ob: Record<string, unknown>) =>
  Object.entries(ob).reduce(
    (acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== "")
        acc[key] = value;
      return acc;
    },
    {} as typeof ob,
  );
