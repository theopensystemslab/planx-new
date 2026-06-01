import { afterEach, beforeAll, expect } from "vitest";
import { setProjectAnnotations } from "@storybook/react";
import axe from "axe-core";
import * as projectAnnotations from "./preview";

const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);

afterEach(async () => {
  const root = document.body;
  if (!root || root.children.length === 0) return;

  const results = await axe.run(root as Element);

  if (results.violations.length > 0) {
    const details = results.violations
      .map((v) => {
        const nodes = v.nodes
          .slice(0, 2)
          .map((n) => `    ${n.target}`)
          .join("\n");
        return `[${v.impact}] ${v.id}: ${v.description}\n${nodes}`;
      })
      .join("\n\n");

    expect.fail(`Accessibility violations:\n\n${details}`);
  }
});
