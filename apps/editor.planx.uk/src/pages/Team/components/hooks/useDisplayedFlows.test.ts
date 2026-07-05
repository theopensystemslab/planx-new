import { renderHook, waitFor } from "@testing-library/react";
import type { FlowSummary } from "pages/FlowEditor/lib/store/editor";
import {
  filterOptions,
  sortOptions,
} from "pages/Team/helpers/sortAndFilterOptions";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDisplayedFlows } from "./useDisplayedFlows";

let mockSearchParams: Record<string, string | undefined> = {};

vi.mock("@tanstack/react-router", async () => {
  const actual = await vi.importActual("@tanstack/react-router");
  return {
    ...actual,
    useSearch: () => mockSearchParams,
  };
});

const baseFlow: Omit<FlowSummary, "id" | "name" | "slug"> = {
  status: "online",
  updatedAt: "2024-01-01T00:00:00Z",
  summary: "",
  operations: [],
  publishedFlows: [],
  templatedFrom: null,
  isTemplate: false,
  isListedOnLPS: false,
  isService: true,
  pinnedFlows: [],
  template: { team: { name: "" } },
};

const publishedFlow = (
  overrides: Partial<FlowSummary["publishedFlows"][number]> = {},
): FlowSummary["publishedFlows"][number] => ({
  publishedAt: "2024-06-01T00:00:00Z",
  hasSendComponent: false,
  hasVisiblePayComponent: false,
  hasEnabledServiceCharge: false,
  ...overrides,
});

const flow = (
  overrides: Partial<FlowSummary> & Pick<FlowSummary, "id" | "name" | "slug">,
): FlowSummary => ({
  ...baseFlow,
  ...overrides,
});

const mockFlows: FlowSummary[] = [
  flow({
    id: "1",
    name: "Apply for a certificate",
    slug: "apply-certificate",
    status: "online",
    updatedAt: "2024-03-01T00:00:00Z",
    publishedFlows: [
      publishedFlow({
        hasSendComponent: true,
        publishedAt: "2024-03-01T00:00:00Z",
      }),
    ],
    isListedOnLPS: true,
  }),
  flow({
    id: "2",
    name: "Report a planning breach",
    slug: "report-a-planning-breach",
    status: "offline",
    updatedAt: "2024-01-01T00:00:00Z",
    publishedFlows: [
      publishedFlow({
        hasVisiblePayComponent: true,
        publishedAt: "2024-01-01T00:00:00Z",
      }),
    ],
    isListedOnLPS: false,
  }),
  flow({
    id: "3",
    name: "Pre application advice",
    slug: "pre-application-advice",
    status: "online",
    updatedAt: "2024-02-01T00:00:00Z",
    publishedFlows: [
      publishedFlow({
        hasEnabledServiceCharge: true,
        publishedAt: "2024-02-01T00:00:00Z",
      }),
    ],
    templatedFrom: "template-source",
    isListedOnLPS: false,
  }),
  flow({
    id: "4",
    name: "Legal declarations",
    slug: "legal-declarations",
    status: "online",
    updatedAt: "2024-04-01T00:00:00Z",
    publishedFlows: [],
    isTemplate: true,
  }),
];

const renderUseDisplayedFlows = (flows: FlowSummary[] | null = mockFlows) =>
  renderHook(() => useDisplayedFlows({ flows, filterOptions, sortOptions }));

beforeEach(() => {
  mockSearchParams = {};
});

describe("useDisplayedFlows - base behaviour", () => {
  it("returns null displayedFlows when flows is null (loading state)", () => {
    const { result } = renderUseDisplayedFlows(null);
    expect(result.current.displayedFlows).toBeNull();
    expect(result.current.isFiltered).toBe(false);
  });

  it("returns all flows when nothing is active", () => {
    const { result } = renderUseDisplayedFlows();
    expect(result.current.displayedFlows).toHaveLength(mockFlows.length);
    expect(result.current.isFiltered).toBe(false);
  });

  it("sets isFiltered to true when a filter reduces the list", () => {
    mockSearchParams = { "service-status": "offline" };
    const { result } = renderUseDisplayedFlows();
    expect(result.current.isFiltered).toBe(true);
  });
});

describe("useDisplayedFlows - search", () => {
  it("narrows the list to fuzzy-matched flows", async () => {
    mockSearchParams = { search: "certificate" };
    const { result } = renderUseDisplayedFlows();
    await waitFor(() =>
      expect(result.current.displayedFlows!.map((f) => f.slug)).toEqual([
        "apply-certificate",
      ]),
    );
    expect(result.current.isFiltered).toBe(true);
  });

  it("returns an empty list when nothing matches the search", async () => {
    mockSearchParams = { search: "zzzzzz" };
    const { result } = renderUseDisplayedFlows();
    await waitFor(() => expect(result.current.displayedFlows).toHaveLength(0));
  });

  it("applies filters on top of the search results (AND)", async () => {
    // "advice" matches only pre-application-advice, which is online
    mockSearchParams = { search: "advice", "service-status": "offline" };
    const { result } = renderUseDisplayedFlows();
    await waitFor(() => expect(result.current.displayedFlows).toHaveLength(0));
  });
});

describe("useDisplayedFlows - service-status filter", () => {
  it("returns only online services when service-status=online", () => {
    mockSearchParams = { "service-status": "online" };
    const { result } = renderUseDisplayedFlows();
    const slugs = result.current.displayedFlows!.map((f) => f.slug);
    expect(slugs).toContain("apply-certificate");
    expect(slugs).toContain("pre-application-advice");
    expect(slugs).toContain("legal-declarations");
    expect(slugs).not.toContain("report-a-planning-breach");
  });

  it("returns only offline services when service-status=offline", () => {
    mockSearchParams = { "service-status": "offline" };
    const { result } = renderUseDisplayedFlows();
    expect(result.current.displayedFlows!.map((f) => f.slug)).toEqual([
      "report-a-planning-breach",
    ]);
  });

  it("excludes flows that are not services even when the status matches", () => {
    const flows = [
      flow({
        id: "5",
        name: "Internal portal",
        slug: "internal-portal",
        status: "online",
        isService: false,
      }),
      flow({
        id: "6",
        name: "Public service",
        slug: "public-service",
        status: "online",
        isService: true,
      }),
    ];
    mockSearchParams = { "service-status": "online" };
    const { result } = renderUseDisplayedFlows(flows);
    expect(result.current.displayedFlows!.map((f) => f.slug)).toEqual([
      "public-service",
    ]);
  });
});

describe("useDisplayedFlows - flow-type filter", () => {
  it("returns submission flows (hasSendComponent and isService)", () => {
    mockSearchParams = { "flow-type": "submission" };
    const { result } = renderUseDisplayedFlows();
    expect(result.current.displayedFlows!.map((f) => f.slug)).toEqual([
      "apply-certificate",
    ]);
  });

  it("excludes a send-component flow that is not a service from submission", () => {
    const flows = [
      flow({
        id: "7",
        name: "Send but not service",
        slug: "send-not-service",
        isService: false,
        publishedFlows: [publishedFlow({ hasSendComponent: true })],
      }),
    ];
    mockSearchParams = { "flow-type": "submission" };
    const { result } = renderUseDisplayedFlows(flows);
    expect(result.current.displayedFlows).toHaveLength(0);
  });

  it("returns fee carrying flows (hasVisiblePayComponent)", () => {
    mockSearchParams = { "flow-type": "fee carrying" };
    const { result } = renderUseDisplayedFlows();
    expect(result.current.displayedFlows!.map((f) => f.slug)).toEqual([
      "report-a-planning-breach",
    ]);
  });

  it("returns service charge enabled flows", () => {
    mockSearchParams = { "flow-type": "service charge enabled" };
    const { result } = renderUseDisplayedFlows();
    expect(result.current.displayedFlows!.map((f) => f.slug)).toEqual([
      "pre-application-advice",
    ]);
  });
});

describe("useDisplayedFlows - templates filter", () => {
  it("returns flows derived from a template (templated)", () => {
    mockSearchParams = { templates: "templated" };
    const { result } = renderUseDisplayedFlows();
    expect(result.current.displayedFlows!.map((f) => f.slug)).toEqual([
      "pre-application-advice",
    ]);
  });

  it("returns flows that are source templates", () => {
    mockSearchParams = { templates: "source template" };
    const { result } = renderUseDisplayedFlows();
    expect(result.current.displayedFlows!.map((f) => f.slug)).toEqual([
      "legal-declarations",
    ]);
  });
});

describe("useDisplayedFlows - lps-listing filter", () => {
  it("returns flows listed on LPS", () => {
    mockSearchParams = { "lps-listing": "listed" };
    const { result } = renderUseDisplayedFlows();
    expect(result.current.displayedFlows!.map((f) => f.slug)).toEqual([
      "apply-certificate",
    ]);
  });

  it("returns flows not listed on LPS", () => {
    mockSearchParams = { "lps-listing": "not listed" };
    const { result } = renderUseDisplayedFlows();
    const slugs = result.current.displayedFlows!.map((f) => f.slug);
    expect(slugs).toContain("report-a-planning-breach");
    expect(slugs).toContain("pre-application-advice");
    expect(slugs).not.toContain("apply-certificate");
  });
});

describe("useDisplayedFlows - multiple filters (AND behaviour)", () => {
  it("applies two filters together, returning only flows that satisfy both", () => {
    // apply-certificate is both online and listed on LPS
    mockSearchParams = { "service-status": "online", "lps-listing": "listed" };
    const { result } = renderUseDisplayedFlows();
    expect(result.current.displayedFlows!.map((f) => f.slug)).toEqual([
      "apply-certificate",
    ]);
  });

  it("returns an empty array when no flows satisfy all active filters", () => {
    // report-a-planning-breach is offline but not a submission type
    mockSearchParams = {
      "service-status": "offline",
      "flow-type": "submission",
    };
    const { result } = renderUseDisplayedFlows();
    expect(result.current.displayedFlows).toHaveLength(0);
    expect(result.current.isFiltered).toBe(true);
  });
});

describe("useDisplayedFlows - sorting", () => {
  it("sorts by last-edited descending (newest first) by default", () => {
    const { result } = renderUseDisplayedFlows();
    const slugs = result.current.displayedFlows!.map((f) => f.slug);
    expect(slugs).toEqual([
      "legal-declarations", // 2024-04-01
      "apply-certificate", // 2024-03-01
      "pre-application-advice", // 2024-02-01
      "report-a-planning-breach", // 2024-01-01
    ]);
  });

  it("sorts by last-edited ascending (oldest first)", () => {
    mockSearchParams = { sort: "last-edited", sortDirection: "asc" };
    const { result } = renderUseDisplayedFlows();
    const slugs = result.current.displayedFlows!.map((f) => f.slug);
    expect(slugs[0]).toBe("report-a-planning-breach");
    expect(slugs[slugs.length - 1]).toBe("legal-declarations");
  });

  it("sorts by name (slug) ascending (A-Z)", () => {
    mockSearchParams = { sort: "name", sortDirection: "asc" };
    const { result } = renderUseDisplayedFlows();
    const slugs = result.current.displayedFlows!.map((f) => f.slug);
    expect(slugs).toEqual([
      "apply-certificate",
      "legal-declarations",
      "pre-application-advice",
      "report-a-planning-breach",
    ]);
  });

  it("sorts by name (slug) descending (Z-A)", () => {
    mockSearchParams = { sort: "name", sortDirection: "desc" };
    const { result } = renderUseDisplayedFlows();
    const slugs = result.current.displayedFlows!.map((f) => f.slug);
    expect(slugs).toEqual([
      "report-a-planning-breach",
      "pre-application-advice",
      "legal-declarations",
      "apply-certificate",
    ]);
  });

  it("sorts by last-published descending", () => {
    mockSearchParams = { sort: "last-published", sortDirection: "desc" };
    const { result } = renderUseDisplayedFlows();
    const slugs = result.current.displayedFlows!.map((f) => f.slug);
    // lodash orderBy puts undefined values first in descending order,
    // so legal-declarations (no publishedFlows) sorts to the top
    expect(slugs[0]).toBe("legal-declarations");
    expect(slugs.slice(1)).toEqual([
      "apply-certificate",
      "pre-application-advice",
      "report-a-planning-breach",
    ]);
  });

  it("falls back to last-edited descending for an unrecognised sort param", () => {
    mockSearchParams = { sort: "nonexistent", sortDirection: "asc" };
    const { result } = renderUseDisplayedFlows();
    // getSortParams falls back to sortOptions[0] + desc, so order matches default
    const slugs = result.current.displayedFlows!.map((f) => f.slug);
    expect(slugs[0]).toBe("legal-declarations");
    expect(slugs[slugs.length - 1]).toBe("report-a-planning-breach");
  });
});
