import type { NotionBlock, NotionRichText } from "../types.js";
import { blocksToMarkdown, richTextToMarkdown } from "./blocksToMarkdown.js";

const rt = (
  text: string,
  annotations: Partial<NotionRichText["annotations"]> = {},
  href: string | null = null,
): NotionRichText => ({
  plain_text: text,
  href,
  annotations: {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    color: "default",
    ...annotations,
  },
});

const block = (
  type: string,
  extra: Partial<NotionBlock> = {},
): NotionBlock => ({
  id: Math.random().toString(36).slice(2),
  type,
  has_children: Boolean(extra.children?.length),
  ...extra,
});

describe("richTextToMarkdown", () => {
  it("applies annotations and links", () => {
    expect(
      richTextToMarkdown([
        rt("plain "),
        rt("bold", { bold: true }),
        rt(" "),
        rt("code", { code: true }),
        rt(" "),
        rt("link", {}, "https://example.com"),
      ]),
    ).toBe("plain **bold** `code` [link](https://example.com)");
  });

  it("escapes markdown control characters in plain text but not in code spans", () => {
    expect(richTextToMarkdown([rt("a * b _ c")])).toBe("a \\* b \\_ c");
    expect(richTextToMarkdown([rt("a * b", { code: true })])).toBe("`a * b`");
  });
});

describe("blocksToMarkdown", () => {
  it("converts headings and paragraphs", () => {
    const md = blocksToMarkdown([
      block("heading_1", { heading_1: { rich_text: [rt("Title")] } }),
      block("paragraph", { paragraph: { rich_text: [rt("Some text.")] } }),
    ]);
    expect(md).toBe("# Title\n\nSome text.");
  });

  it("numbers ordered list items and resets between lists", () => {
    const md = blocksToMarkdown([
      block("numbered_list_item", {
        numbered_list_item: { rich_text: [rt("one")] },
      }),
      block("numbered_list_item", {
        numbered_list_item: { rich_text: [rt("two")] },
      }),
      block("paragraph", { paragraph: { rich_text: [rt("break")] } }),
      block("numbered_list_item", {
        numbered_list_item: { rich_text: [rt("fresh")] },
      }),
    ]);
    expect(md).toBe("1. one\n2. two\n\nbreak\n\n1. fresh");
  });

  it("indents nested list items", () => {
    const md = blocksToMarkdown([
      block("bulleted_list_item", {
        bulleted_list_item: { rich_text: [rt("parent")] },
        children: [
          block("bulleted_list_item", {
            bulleted_list_item: { rich_text: [rt("child")] },
          }),
        ],
      }),
    ]);
    expect(md).toBe("- parent\n  - child");
  });

  it("renders callouts with their emoji as blockquotes", () => {
    const md = blocksToMarkdown([
      block("callout", {
        callout: {
          rich_text: [rt("Heads up")],
          icon: { type: "emoji", emoji: "💡" },
        },
      }),
    ]);
    expect(md).toBe("> 💡 Heads up");
  });

  it("fences code blocks with their language", () => {
    const md = blocksToMarkdown([
      block("code", {
        code: { rich_text: [rt("const a = 1;")], language: "typescript" },
      }),
    ]);
    expect(md).toBe("```typescript\nconst a = 1;\n```");
  });

  it("renders external images with caption alt text", () => {
    const md = blocksToMarkdown([
      block("image", {
        image: {
          type: "external",
          external: { url: "https://example.com/a.png" },
          caption: [rt("A diagram")],
        },
      }),
    ]);
    expect(md).toBe("![A diagram](https://example.com/a.png)");
  });

  it("renders embed blocks as links (caption as text, url as fallback)", () => {
    const storybookUrl =
      "https://storybook.planx.uk/iframe.html?id=planx-components-section--basic&viewMode=story";
    expect(
      blocksToMarkdown([
        block("embed", {
          embed: { url: storybookUrl, caption: [rt("Section")] },
        }),
      ]),
    ).toBe(`[Section](${storybookUrl})`);
    expect(
      blocksToMarkdown([block("embed", { embed: { url: storybookUrl } })]),
    ).toBe(`[${storybookUrl}](${storybookUrl})`);
  });

  it("renders video and bookmark blocks as links", () => {
    expect(
      blocksToMarkdown([
        block("video", {
          video: {
            type: "external",
            external: { url: "https://youtu.be/abc" },
          },
        }),
      ]),
    ).toBe("[https://youtu.be/abc](https://youtu.be/abc)");
    expect(
      blocksToMarkdown([
        block("bookmark", { bookmark: { url: "https://example.com" } }),
      ]),
    ).toBe("[https://example.com](https://example.com)");
  });

  it("emits nested content for unhandled container blocks", () => {
    const md = blocksToMarkdown([
      block("column_list", {
        children: [
          block("paragraph", {
            paragraph: { rich_text: [rt("inside column")] },
          }),
        ],
      }),
    ]);
    expect(md).toBe("inside column");
  });
});
