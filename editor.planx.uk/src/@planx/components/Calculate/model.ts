import * as math from "mathjs";

import { MoreInformation, parseMoreInformation } from "../shared";

export interface Calculate extends MoreInformation {
  output: string;
  defaults: Record<string, number>;
  formula: string;
  samples: Record<string, number>;
  formatOutputForAutomations?: boolean;
}

export interface Input {
  dataField: string;
  defaultValue: string;
}

export const parseCalculate = (
  data: Record<string, any> | undefined,
): Calculate => ({
  ...parseMoreInformation(data),
  output: data?.output || "",
  defaults: data?.defaults || {},
  formula: data?.formula || "",
  samples: data?.samples || {},
  formatOutputForAutomations: data?.formatOutputForAutomations || false,
});

export function getVariables(input: string): Set<string> {
  const vars = new Set();
  const ast = math.parse(input);
  const _code = ast
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

  return code.evaluate(serializeKeys(applyDefaults(scope, defaults)));

  function flattenVariables(node: any) {
    if (node instanceof math.AccessorNode) {
      // flatten the nested AccessorNode into a SymbolNode to avoid iterating its children
      return new math.SymbolNode(
        // serialize dot notation
        serialize(node.toString()),
      );
    }
    return node;
  }

  function serializeKeys(object: any): Object {
    return Object.fromEntries(
      Object.entries(object).map(([key, value]) => [
        serialize(key),
        Array.isArray(value) ? value[0] : value,
      ]),
    );
  }

  function applyDefaults(object: any, defaults: any) {
    const keys = new Set([...Object.keys(object), ...Object.keys(defaults)]);
    return Object.fromEntries(
      [...keys].map((key) => [key, object[key] || defaults[key]]),
    );
  }
}

// Serialization is only necessary internally.
// Mathjs can't handle keys with dots in their names e.g. `property.number`
// This complexity should never be exposed to this component's consumers.
function serialize(x: string) {
  return x.replace(/\./g, "_");
}
