import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { logger } from "airbrake";
import { vi } from "vitest";

import type { Store } from "..";
import { getIndexedFlow } from "./indexedFlow";

vi.mock("airbrake", () => ({ logger: { notify: vi.fn() } }));

const mockFlow: Store.Flow = {
  _root: { edges: ["folder"] },
  folder: {
    type: TYPES.InternalPortal,
    data: { text: "Folder" },
    edges: ["question"],
  },
  question: {
    type: TYPES.Question,
    data: { text: "Question" },
    edges: ["answer"],
  },
  answer: { type: TYPES.Answer, data: { text: "Answer" } },
};

describe("getIndexedFlow", () => {
  it("orders nodes top-down", () => {
    const { ordered } = getIndexedFlow(mockFlow);

    expect(ordered.map(({ id }) => id)).toEqual([
      "folder",
      "question",
      "answer",
    ]);
  });

  it("indexes nodes by id, with their parent and internal portal", () => {
    const { nodes } = getIndexedFlow(mockFlow);

    expect(nodes.answer).toMatchObject({
      parentId: "question",
      internalPortalId: "folder",
    });
  });

  it("returns the same result for the same flow", () => {
    expect(getIndexedFlow(mockFlow)).toBe(getIndexedFlow(mockFlow));
  });

  it("re-indexes a new version of the flow", () => {
    const before = getIndexedFlow(mockFlow);

    const updatedFlow: Store.Flow = {
      ...mockFlow,
      question: { ...mockFlow.question, edges: ["answer", "newAnswer"] },
      newAnswer: { type: TYPES.Answer, data: { text: "New answer" } },
    };
    const after = getIndexedFlow(updatedFlow);

    expect(after).not.toBe(before);
    expect(after.nodes.newAnswer).toMatchObject({
      parentId: "question",
      internalPortalId: "folder",
    });
  });

  it("logs an error and returns an empty result if the flow cannot be sorted", () => {
    const brokenFlow: Store.Flow = {
      _root: { edges: ["missingNode"] },
    };

    const { ordered, nodes } = getIndexedFlow(brokenFlow);

    expect(ordered).toEqual([]);
    expect(nodes).toEqual({});
    expect(logger.notify).toHaveBeenCalled();
  });
});
