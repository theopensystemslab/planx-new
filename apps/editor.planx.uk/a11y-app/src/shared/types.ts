export type Impact = "critical" | "serious" | "moderate" | "minor";
export type Audience = "public" | "editor";

export interface AssertionResult {
  ancestorTitles: string[];
  fullName: string;
  title: string;
  status: "passed" | "failed" | "pending";
  duration: number;
  failureMessages: string[];
  meta?: { storyId: string; reports: unknown[] };
}

export interface SuiteResult {
  name: string;
  status: "passed" | "failed";
  assertionResults: AssertionResult[];
}

export interface VitestReport {
  numTotalTestSuites: number;
  numPassedTestSuites: number;
  numFailedTestSuites: number;
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  testResults: SuiteResult[];
}

export interface Violation {
  impact: Impact;
  ruleId: string;
  description: string;
  component: string;
  story: string;
  storyId: string;
  audience: Audience;
  nodes: string[];
}

export const IMPACT_ORDER: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
};

export const IMPACT_COLOUR: Record<string, string> = {
  critical: "#b71c1c",
  serious: "#e65100",
  moderate: "#f9a825",
  minor: "#1b5e20",
};

export const IMPACT_BG: Record<string, string> = {
  critical: "#ffebee",
  serious: "#fff3e0",
  moderate: "#fffde7",
  minor: "#e8f5e9",
};
