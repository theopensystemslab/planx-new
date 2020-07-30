import { createTest } from "./shared";

test(
  "leave the graph alone",
  createTest("alone", { nodes: {}, edges: [] }, [], { nodes: {}, edges: [] })
);
