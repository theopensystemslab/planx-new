import { ComponentType } from "@opensystemslab/planx-core/types";
import type { FlowGraph } from "@opensystemslab/planx-core/types";

export const flow: FlowGraph = {
  _root: {
    edges: [
      "XBZN1QCNo9",
      "3DI2GtpCAb",
      "4veEdqnLTW",
      "Z1R1LRmLbY",
      "vPr0ukG8JE",
      "pWCcG9ToZY",
      "Fz3VuXRlTb",
      "NUpGwW4Pqe",
      "rZePKmcD73",
    ],
  },
  "1hJpwGw4Je": {
    data: { text: "C" },
    type: ComponentType.Answer,
    edges: ["7URtB1N5zG"],
  },
  "3DI2GtpCAb": {
    data: { text: "Question 1" },
    type: ComponentType.Question,
    edges: ["kLK7wbmOEZ", "5bebjoffUb", "JHLgiz66t4"],
  },
  "4veEdqnLTW": { data: { title: "Section Two" }, type: ComponentType.Section },
  "5bebjoffUb": { data: { text: "B" }, type: ComponentType.Answer },
  "7URtB1N5zG": {
    data: { color: "#EFEFEF", title: "Reached C", resetButton: false },
    type: ComponentType.Notice,
  },
  Fz3VuXRlTb: {
    data: { content: "<p>About to send</p>" },
    type: ComponentType.Content,
  },
  JHLgiz66t4: { data: { text: "C" }, type: ComponentType.Answer },
  NUFNkSkxqR: {
    data: { color: "#EFEFEF", title: "Reached B", resetButton: false },
    type: ComponentType.Notice,
  },
  NUpGwW4Pqe: {
    data: { title: "Send", destinations: ["email"] },
    type: ComponentType.Send,
  },
  OzCQoqgcAs: {
    data: { color: "#EFEFEF", title: "Reached D", resetButton: false },
    type: ComponentType.Notice,
  },
  PErULqxbIf: {
    data: { color: "#EFEFEF", title: "Reached A", resetButton: false },
    type: ComponentType.Notice,
  },
  SBzvpSq8DD: {
    data: { text: "B" },
    type: ComponentType.Answer,
    edges: ["NUFNkSkxqR"],
  },
  T1X91EICsC: {
    data: { text: "Multi-select", allRequired: false },
    type: ComponentType.Checklist,
    edges: ["oLkOyC2LeL", "SBzvpSq8DD", "1hJpwGw4Je", "WdKErxvyoo"],
  },
  WMwJZHKJE3: { data: { text: "A" }, type: ComponentType.Answer },
  WdKErxvyoo: {
    data: { text: "D" },
    type: ComponentType.Answer,
    edges: ["OzCQoqgcAs"],
  },
  XBZN1QCNo9: { data: { title: "Section One" }, type: ComponentType.Section },
  Z1R1LRmLbY: {
    data: { text: "Question 2" },
    type: ComponentType.Question,
    edges: ["WMwJZHKJE3", "nSBYMoHnwE"],
  },
  kLK7wbmOEZ: { data: { text: "A" }, type: ComponentType.Answer },
  nSBYMoHnwE: {
    data: { text: "B" },
    type: ComponentType.Answer,
    edges: ["T1X91EICsC"],
  },
  oLkOyC2LeL: {
    data: { text: "A" },
    type: ComponentType.Answer,
    edges: ["PErULqxbIf"],
  },
  pWCcG9ToZY: { data: { title: "Section Three" }, type: ComponentType.Section },
  rZePKmcD73: {
    data: {
      heading: "Application sent",
      moreInfo: "<h2>You will be contacted</h2>",
      contactInfo: "You can contact us at <em>planning@abc.gov.uk</em>",
    },
    type: ComponentType.Confirmation,
  },
  vPr0ukG8JE: {
    data: {
      color: "#EFEFEF",
      title: "Reached the end of section two",
      resetButton: false,
    },
    type: ComponentType.Notice,
  },
};
