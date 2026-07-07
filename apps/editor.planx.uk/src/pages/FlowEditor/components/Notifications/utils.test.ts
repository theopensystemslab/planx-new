import type { Notification } from "./types";
import { partitionBySuperseded } from "./utils";

const makeNotification = (
  id: number,
  flowSlug: string,
  overrides: Partial<Notification> = {},
): Notification => ({
  id,
  flow: { name: flowSlug, slug: flowSlug },
  team: { name: "test-team", slug: "test-team" },
  type: "updated_templated_flow",
  createdAt: "2024-01-01T00:00:00Z",
  resolvedAt: null,
  resolvedByUser: null,
  ...overrides,
});

describe("partitionBySuperseded", () => {
  it("returns empty arrays when given no notifications", () => {
    expect(partitionBySuperseded([])).toEqual({ current: [], superseded: [] });
  });

  it("places a single notification in current", () => {
    const notification = makeNotification(1, "flow-a");
    const { current, superseded } = partitionBySuperseded([notification]);

    expect(current).toEqual([notification]);
    expect(superseded).toEqual([]);
  });

  it("places notifications for different flows in current", () => {
    const a = makeNotification(1, "flow-a");
    const b = makeNotification(2, "flow-b");
    const { current, superseded } = partitionBySuperseded([a, b]);

    expect(current).toEqual([a, b]);
    expect(superseded).toEqual([]);
  });

  it("places the most recent notification in current and older ones in superseded", () => {
    const newer = makeNotification(1, "flow-a");
    const older = makeNotification(2, "flow-a");
    const { current, superseded } = partitionBySuperseded([newer, older]);

    expect(current).toEqual([newer]);
    expect(superseded).toEqual([older]);
  });

  it("supersedes all but the first notification when multiple share a flow", () => {
    const first = makeNotification(1, "flow-a");
    const second = makeNotification(2, "flow-a");
    const third = makeNotification(3, "flow-a");
    const { current, superseded } = partitionBySuperseded([
      first,
      second,
      third,
    ]);

    expect(current).toEqual([first]);
    expect(superseded).toEqual([second, third]);
  });

  it("handles a mix of flows correctly", () => {
    const a1 = makeNotification(1, "flow-a");
    const b1 = makeNotification(2, "flow-b");
    const a2 = makeNotification(3, "flow-a");
    const b2 = makeNotification(4, "flow-b");
    const c1 = makeNotification(5, "flow-c");
    const { current, superseded } = partitionBySuperseded([a1, b1, a2, b2, c1]);

    expect(current).toEqual([a1, b1, c1]);
    expect(superseded).toEqual([a2, b2]);
  });

  it("preserves the relative order of notifications within each partition", () => {
    const a1 = makeNotification(1, "flow-a");
    const b1 = makeNotification(2, "flow-b");
    const a2 = makeNotification(3, "flow-a");
    const a3 = makeNotification(4, "flow-a");
    const { superseded } = partitionBySuperseded([a1, b1, a2, a3]);

    expect(superseded).toEqual([a2, a3]);
  });
});
