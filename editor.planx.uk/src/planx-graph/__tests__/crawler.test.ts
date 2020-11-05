import { TYPES } from "../../pages/FlowEditor/data/types";
import Crawler from "../crawler";

test("crawling a basic graph", () => {
  const crawler = new Crawler({
    _root: {
      edges: ["a", "b"],
    },
    a: {
      type: TYPES.Statement,
      edges: ["c"],
    },
    b: {
      type: TYPES.Statement,
    },
    c: {
      type: TYPES.Response,
      edges: ["d"],
    },
    d: {
      type: TYPES.Statement,
      edges: ["e", "f"],
    },
    e: { type: TYPES.Response },
    f: { type: TYPES.Response },
  });

  expect(crawler.upcomingIds).toEqual(["a"]);

  crawler.record("a", ["c"]);

  expect(crawler.upcomingIds).toEqual(["d"]);

  crawler.record("d", ["e", "f"]);

  expect(crawler.upcomingIds).toEqual([]);
});

test("notice", () => {
  const crawler = new Crawler({
    _root: {
      edges: ["a"],
    },
    a: {
      type: TYPES.Notice,
    },
  });

  expect(crawler.upcomingIds).toEqual(["a"]);
});

test("crawling with portals", () => {
  const crawler = new Crawler({
    _root: {
      edges: ["a", "b"],
    },
    a: {
      type: TYPES.InternalPortal,
      edges: ["c"],
    },
    b: {
      edges: ["d"],
    },
    c: {
      edges: ["d"],
    },
    d: {},
  });

  expect(crawler.upcomingIds).toEqual(["c", "b"]);
});

describe("callbacks", () => {
  test("calls onrecord when recording a node", () => {
    const onRecord = jest.fn();
    const crawler = new Crawler(
      {
        _root: {
          edges: ["a"],
        },
        a: {
          edges: ["b"],
        },
        b: {},
      },
      {
        onRecord,
      }
    );

    crawler.record("a", ["b"]);

    expect(onRecord).toHaveBeenCalledWith("a");
  });
});

describe("error handling", () => {
  test("empty graph object", () => {
    expect(() => new Crawler({})).toThrowError("invalid graph");
  });

  test("cannot record id that doesn't exist", () => {
    const crawler = new Crawler({
      _root: {
        edges: ["a"],
      },
      a: {},
    });

    expect(() => crawler.record("x", [])).toThrowError("id not found");
  });

  test("cannot record id that's already been recorded", () => {
    const crawler = new Crawler({
      _root: {
        edges: ["a"],
      },
      a: {},
    });

    crawler.record("a", []);

    expect(() => crawler.record("a", [])).toThrowError("already recorded");
  });
});
