import trim from "lodash/trim";

export const isSomething = (x: any): boolean =>
  x !== null && x !== undefined && x !== "";

export const sanitize = (x) => {
  if ((x && typeof x === "string") || x instanceof String) {
    return trim(x.replace(/[\u200B-\u200D\uFEFF↵]/g, ""));
  } else if ((x && typeof x === "object") || x instanceof Object) {
    return Object.entries(x).reduce((acc, [k, v]) => {
      v = sanitize(v);
      if (isSomething(v)) acc[k] = v;
      return acc;
    }, {});
  } else {
    return x;
  }
};
