import * as math from "mathjs";

import { MoreInformation, parseMoreInformation } from "../shared";

export interface Calculate extends MoreInformation {
  output: string;
  defaults: Record<string, number>;
  formula: string;
  samples: Record<string, number>;
}

export interface Input {
  dataField: string;
  defaultValue: string;
}

export const parseCalculate = (
  data: Record<string, any> | undefined
): Calculate => ({
  ...parseMoreInformation(data),
  output: data?.output || "",
  defaults: data?.defaults || {},
  formula: data?.formula || "",
  samples: data?.samples || {},
});

export function getVariables(input: string): Set<string> {
  const vars = new Set();
  const ast = math.parse(input);
  const code = ast
    .transform((node: any) => {
      if (
        // variables that have nested fields
        node instanceof math.AccessorNode
      ) {
        vars.add(node.toString());
        return new math.SymbolNode(serialize(node.toString()));
      } else if (
        // variables at the root level don't become `AccessorNode` but `SymbolNode` instead
        node.isSymbolNode &&
        // ignore nodes like `sqrt()` which represent functions not variables
        !math[node.toString()]
      ) {
        // e.g. node = variable
        vars.add(node.toString());
        return node;
      }
      return node;
    })
    .compile();
  return vars as Set<string>;
}

export function evaluate(input: string, scope = {}, defaults = {}): number {
  const ast = math.parse(input);
  const code = ast.transform(flattenVariables).compile();
  return code.evaluate(toUnderscoreNotation(applyDefaults(scope, defaults)));

  function flattenVariables(node: any) {
    if (node instanceof math.AccessorNode) {
      // flatten the nested AccessorNode into a SymbolNode to avoid iterating its children
      return new math.SymbolNode(
        // serialize dot notation
        serialize(node.toString())
      );
    }
    return node;
  }

  function toUnderscoreNotation(object: any): Object {
    return Object.fromEntries(
      Object.entries(object).map(([key, value]) => [serialize(key), value])
    );
  }

  function applyDefaults(object: any, defaults: any) {
    const keys = new Set([...Object.keys(object), ...Object.keys(defaults)]);
    return Object.fromEntries(
      [...keys].map((key) => [key, object[key] || defaults[key]])
    );
  }
}

export function toScope(passport: any): Object {
  return Object.fromEntries(
    Object.entries(passport.data).map(([key, value]) => [
      key,
      (value as any).value[0],
    ])
  );
}

export function evaluatePassport(
  input: string,
  passport: any,
  defaults: any
): number {
  return evaluate(input, toScope(passport), defaults);
}

function serialize(x: string) {
  return x.replace(/\./g, "_");
}
function parse(x: string) {
  return x.replace(/_/g, ".");
}
