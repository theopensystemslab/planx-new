import type { NotionBlock, NotionRichText } from "../types.js";

const INDENT = "  ";
const LIST_TYPES = ["bulleted_list_item", "numbered_list_item", "to_do"];

/**
 * Escape the characters that would otherwise be interpreted as inline markdown
 * syntax. Deliberately narrow — escaping every CommonMark special char (`.`, `-`,
 * `#`, ...) makes ordinary prose read as `Some text\.`
 */
const escapeText = (text: string): string =>
  text.replace(/([\\`*_[\]])/g, "\\$1");

const applyAnnotations = (
  text: string,
  annotations: NotionRichText["annotations"],
): string => {
  if (!text) return text;
  let out = text;
  if (annotations.bold) out = `**${out}**`;
  if (annotations.italic) out = `_${out}_`;
  if (annotations.strikethrough) out = `~~${out}~~`;
  if (annotations.code) out = `\`${out}\``;
  return out;
};

export const richTextToMarkdown = (richText: NotionRichText[] = []): string =>
  richText
    .map((rt) => {
      // Code spans are taken verbatim; everything else gets markdown-escaped
      const base = rt.annotations.code
        ? rt.plain_text
        : escapeText(rt.plain_text);
      const annotated = applyAnnotations(base, rt.annotations);
      return rt.href ? `[${annotated}](${rt.href})` : annotated;
    })
    .join("");

const imageUrl = (block: NotionBlock): string | undefined =>
  block.image?.type === "external"
    ? block.image.external?.url
    : block.image?.file?.url;

/** Indent every non-empty line of a nested block's markdown by one level */
const indent = (markdown: string): string =>
  markdown
    .split("\n")
    .map((line) => (line ? INDENT + line : line))
    .join("\n");

interface Chunk {
  text: string;
  /** list item type, if this chunk is one — controls tight vs. loose joining */
  listType?: string;
}

/**
 * Convert a Notion block tree (as produced by fetchBlockTree) into CommonMark.
 * Nested blocks are rendered at depth 0 then indented by the parent, so callers
 * never need to pass a depth.
 *
 * The editor's markdown renderer has no remark-gfm, so tables and task-list
 * checkboxes are flattened to plain text rather than GFM syntax.
 */
export const blocksToMarkdown = (blocks: NotionBlock[] = []): string => {
  const chunks: Chunk[] = [];
  let orderedIndex = 0;

  for (const block of blocks) {
    if (block.type !== "numbered_list_item") orderedIndex = 0;

    const text = (container?: { rich_text: NotionRichText[] }) =>
      richTextToMarkdown(container?.rich_text);
    const childMarkdown = block.children
      ? blocksToMarkdown(block.children)
      : "";
    // For list items, nested content is indented under the item
    const withChildren = (line: string) =>
      childMarkdown ? `${line}\n${indent(childMarkdown)}` : line;

    switch (block.type) {
      case "heading_1":
        chunks.push({ text: `# ${text(block.heading_1)}` });
        break;
      case "heading_2":
        chunks.push({ text: `## ${text(block.heading_2)}` });
        break;
      case "heading_3":
        chunks.push({ text: `### ${text(block.heading_3)}` });
        break;
      case "paragraph": {
        const value = text(block.paragraph);
        if (value) chunks.push({ text: value });
        if (childMarkdown) chunks.push({ text: childMarkdown });
        break;
      }
      case "bulleted_list_item":
        chunks.push({
          text: withChildren(`- ${text(block.bulleted_list_item)}`),
          listType: block.type,
        });
        break;
      case "numbered_list_item":
        orderedIndex += 1;
        chunks.push({
          text: withChildren(
            `${orderedIndex}. ${text(block.numbered_list_item)}`,
          ),
          listType: block.type,
        });
        break;
      case "to_do":
        // No GFM: render as a bullet with a leading tick marker when checked
        chunks.push({
          text: withChildren(
            `- ${block.to_do?.checked ? "✓ " : ""}${text(block.to_do)}`,
          ),
          listType: block.type,
        });
        break;
      case "quote":
        chunks.push({ text: `> ${text(block.quote)}` });
        break;
      case "callout": {
        const emoji = block.callout?.icon?.emoji
          ? `${block.callout.icon.emoji} `
          : "";
        chunks.push({ text: `> ${emoji}${text(block.callout)}` });
        break;
      }
      case "code":
        chunks.push({
          text: `\`\`\`${block.code?.language ?? ""}\n${text(block.code)}\n\`\`\``,
        });
        break;
      case "divider":
        chunks.push({ text: "---" });
        break;
      case "image": {
        const url = imageUrl(block);
        if (url) {
          const alt = richTextToMarkdown(block.image?.caption).replace(
            /[[\]]/g,
            "",
          );
          chunks.push({ text: `![${alt}](${url})` });
        }
        break;
      }
      case "toggle":
        // No native markdown equivalent; surface the summary then its contents
        chunks.push({ text: `**${text(block.toggle)}**` });
        if (childMarkdown) chunks.push({ text: childMarkdown });
        break;
      default:
        // Unhandled container types (columns, synced blocks, tables, ...) —
        // still emit any nested content we fetched.
        if (childMarkdown) chunks.push({ text: childMarkdown });
        break;
    }
  }

  return chunks
    .map((chunk, i) => {
      const prev = chunks[i - 1];
      if (!prev) return chunk.text;
      // Consecutive list items of the same type join tightly; everything else
      // gets a blank line between it and the previous chunk.
      const tight =
        chunk.listType &&
        prev.listType &&
        LIST_TYPES.includes(chunk.listType) &&
        LIST_TYPES.includes(prev.listType);
      return (tight ? "\n" : "\n\n") + chunk.text;
    })
    .join("")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};
