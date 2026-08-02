import type { Graph } from "@planx/graph";

import type { Pattern } from "./queries";

const summary =
  "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Praesentium voluptatum excepturi at rem enim distinctio officia";

// Has one Question (with an Answer child, which shouldn't count) and one Notice: 2 components
export const mockPatternData: Graph = {
  _root: { edges: ["question", "notice"] },
  question: { type: 100, data: { text: "A question" }, edges: ["answer"] },
  answer: { type: 200, data: { text: "An answer" } },
  notice: { type: 8, data: { title: "A notice" } },
};

const emptyPatternData: Graph = { _root: {} };

export const mockPatterns: Pattern[] = [
  {
    id: "1",
    slug: "pattern-1",
    name: "Pattern 1",
    summary,
    data: emptyPatternData,
  },
  {
    id: "2",
    slug: "pattern-2",
    name: "Pattern 2",
    summary,
    data: emptyPatternData,
  },
  {
    id: "3",
    slug: "pattern-3",
    name: "Pattern 3",
    summary,
    data: mockPatternData,
  },
  {
    id: "4",
    slug: "pattern-4",
    name: "Pattern 4",
    summary,
    data: emptyPatternData,
  },
  {
    id: "5",
    slug: "pattern-5",
    name: "Pattern 5",
    summary,
    data: emptyPatternData,
  },
];
