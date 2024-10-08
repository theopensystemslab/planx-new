import { FlowGraph, IndexedNode } from "@opensystemslab/planx-core/types";
import { SearchResults } from "hooks/useSearch";

export const flow: FlowGraph = {
  _root: {
    edges: ["Ej0xpn4l8u"],
  },
  Ej0xpn4l8u: {
    type: 100,
    data: {
      fn: "country",
      text: "Pick a country",
    },
    edges: ["VhSydY2fTe", "tR9tdaWOvF", "tvUxd2IoPo"],
  },
  VhSydY2fTe: {
    type: 200,
    data: {
      text: "Spain",
      val: "spain",
    },
  },
  tR9tdaWOvF: {
    type: 200,
    data: {
      text: "India",
      val: "india",
    },
  },
  tvUxd2IoPo: {
    type: 200,
    data: {
      text: "Indonesia",
      val: "indonesia",
    },
  },
};

export const results: SearchResults<IndexedNode> = [
  {
    item: {
      id: "tR9tdaWOvF",
      parentId: "Ej0xpn4l8u",
      type: 200,
      data: {
        text: "India",
        val: "india",
      },
    },
    key: "data.val",
    matchIndices: [[0, 2]],
    refIndex: 0,
    matchValue: "india",
  },
  {
    item: {
      id: "tvUxd2IoPo",
      parentId: "Ej0xpn4l8u",
      type: 200,
      data: {
        text: "Indonesia",
        val: "indonesia",
      },
    },
    key: "data.val",
    matchIndices: [[0, 2]],
    refIndex: 0,
    matchValue: "indonesia",
  },
];
