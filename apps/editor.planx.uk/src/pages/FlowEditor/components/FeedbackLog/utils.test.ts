import { describe, expect, it } from "vitest";

import { Feedback } from "./types";
import {
  feedbackStatusText,
  feedbackTypeText,
  getCombinedHelpText,
  stripHTMLTags,
} from "./utils";

describe("feedbackTypeText", () => {
  it.each([
    ["issue", "Issue"],
    ["idea", "Idea"],
    ["comment", "Comment"],
    ["helpful", "Helpful (help text)"],
    ["unhelpful", "Unhelpful (help text)"],
    ["component", "User satisfaction"],
    ["inaccuracy", "Inaccuracy"],
  ] as const)("returns '%s' for type '%s'", (type, expected) => {
    expect(feedbackTypeText(type)).toBe(expected);
  });
});

describe("feedbackStatusText", () => {
  it.each([
    ["unread", "Unread"],
    ["urgent", "Urgent"],
    ["actioned", "Actioned"],
    ["in_progress", "In progress"],
  ] as const)("maps '%s' to '%s'", (status, expected) => {
    expect(feedbackStatusText[status]).toBe(expected);
  });
});

describe("getCombinedHelpText", () => {
  const baseFeedback = {
    helpText: null,
    helpDefinition: null,
    helpSources: null,
  } as unknown as Feedback;

  it("returns empty strings when all help fields are null", () => {
    const result = getCombinedHelpText(baseFeedback);
    expect(result).toEqual({ truncated: "", full: "" });
  });

  it("returns helpText alone when only helpText is set", () => {
    const feedback = { ...baseFeedback, helpText: "<p>Some help</p>" };
    const result = getCombinedHelpText(feedback);
    expect(result.full).toBe("<p>Some help</p>");
    expect(result.truncated).toBe("<p>Some help</p>");
  });

  it("joins helpText, helpDefinition and helpSources with a space", () => {
    const feedback = {
      ...baseFeedback,
      helpText: "Text",
      helpDefinition: "Def",
      helpSources: "Sources",
    };
    const result = getCombinedHelpText(feedback);
    expect(result.full).toBe("Text Def Sources");
    expect(result.truncated).toBe("Text Def Sources");
  });

  it("filters out falsy values when combining", () => {
    const feedback = {
      ...baseFeedback,
      helpText: "Text",
      helpDefinition: null,
      helpSources: "Sources",
    };
    const result = getCombinedHelpText(feedback);
    expect(result.full).toBe("Text Sources");
  });

  it("returns the same truncated and full when text is exactly 65 chars", () => {
    const text = "a".repeat(65);
    const feedback = { ...baseFeedback, helpText: text };
    const result = getCombinedHelpText(feedback);
    expect(result.full).toBe(text);
    expect(result.truncated).toBe(text);
  });

  it("truncates at 65 chars and appends '...</p>' when text exceeds limit", () => {
    const text = "a".repeat(100);
    const feedback = { ...baseFeedback, helpText: text };
    const result = getCombinedHelpText(feedback);
    expect(result.full).toBe(text);
    expect(result.truncated).toBe(`${"a".repeat(65)}...</p>`);
  });
});

describe("stripHTMLTags", () => {
  it("removes simple <p> tags", () => {
    expect(stripHTMLTags("<p>Hello</p>")).toBe("Hello");
  });

  it("removes nested tags", () => {
    expect(stripHTMLTags("<p><strong>Bold</strong> text</p>")).toBe(
      "Bold text",
    );
  });

  it("returns the original string when no HTML tags are present", () => {
    expect(stripHTMLTags("plain text")).toBe("plain text");
  });

  it("does not throw when given undefined", () => {
    expect(() => stripHTMLTags(undefined as unknown as string)).not.toThrow();
  });
});
