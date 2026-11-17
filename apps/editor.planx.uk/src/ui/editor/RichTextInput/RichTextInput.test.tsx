import { act, screen, waitFor, within } from "@testing-library/react";
import type { Editor } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import { setup } from "test/utils";
import InputLabel from "ui/editor/InputLabel";
import { vi } from "vitest";

import { RichTextToolbar } from "./components/RichTextToolbar";
import RichTextInput from "./RichTextInput";
import { commonExtensions } from "./tiptapExtensions";
import { fromHtml, modifyDeep, toHtml } from "./utils";

// jsdom does not implement layout APIs which ProseMirror calls on mousedown (elementFromPoint)
// and when positioning the selection / bubble menu (Range rects)
beforeAll(() => {
  Object.defineProperty(document, "elementFromPoint", {
    value: vi.fn(() => null),
    writable: true,
    configurable: true,
  });
  Range.prototype.getClientRects = vi.fn(() => [] as unknown as DOMRectList);
  Range.prototype.getBoundingClientRect = vi.fn(() => new DOMRect());
});

afterAll(() => {
  // @ts-expect-error - removing the stubs restores jsdom's default (unimplemented) state
  delete document.elementFromPoint;
  // @ts-expect-error - as above
  delete Range.prototype.getClientRects;
  // @ts-expect-error - as above
  delete Range.prototype.getBoundingClientRect;
});

/**
 * The BubbleMenu only attaches its DOM whilst there's a selection, so exercise the toolbar
 * directly against a real editor instance
 */
const ToolbarHarness = ({
  content,
  showHeadings = true,
}: {
  content: string;
  showHeadings?: boolean;
}) => {
  const editor = useEditor({ extensions: commonExtensions, content });
  if (!editor) return null;
  return (
    <>
      <RichTextToolbar editor={editor} showHeadings={showHeadings} />
      <EditorContent editor={editor} />
    </>
  );
};

// Tiptap exposes the editor instance on its root DOM node
const getEditor = (container: HTMLElement) =>
  (container.querySelector(".ProseMirror") as unknown as { editor: Editor })
    .editor;

test("modifyDeep helper", () => {
  /**
   * This example traverses a nested structure and increments every even number. The modifier function
   * returns `null` for every level where it didn't find a number, instructing the function to leave
   * the value unchanged at that level but keep traversing downwards to see if there is something to change.
   */
  expect(
    modifyDeep((val) => {
      if (typeof val !== "number") return null;
      const isEven = val % 2 === 0;
      return isEven ? val + 1 : val;
    })({
      a: { c: { val: 2 } },
      b: { val: 3 },
      d: [1, 2, 3, 4],
    }),
  ).toEqual({
    a: { c: { val: 3 } },
    b: { val: 3 },
    d: [1, 3, 3, 5],
  });
});

test.each([
  "<p></p>",
  "<p> </p>",
  "<p>&nbsp;</p>",
  "<p> </p><p>   </p>",
  "<p><br></p>",
])("whitespace-only content %s is converted to an empty string", (input) => {
  expect(toHtml(fromHtml(input))).toBe("");
});

test("content with text is preserved", () => {
  expect(toHtml(fromHtml("<p> Hello </p>"))).toContain("Hello");
});

test("pasted links are stripped of classes and <u> wrappers", () => {
  const pasted = `<p><u><a href="https://example.com" class="govuk-link external">Example</a></u></p>`;
  const html = toHtml(fromHtml(pasted));

  expect(html).not.toContain("class=");
  expect(html).not.toContain("<u>");
  expect(html).toContain(`href="https://example.com"`);
  expect(html).toContain(">Example</a>");
});

describe("formatting toolbar", () => {
  it("renders labelled formatting controls", async () => {
    await setup(<ToolbarHarness content="" />);
    const toolbar = screen.getByRole("toolbar", { name: "Text formatting" });

    for (const label of [
      "Heading",
      "Subheading",
      "Bold",
      "Italic",
      "Bulleted list",
      "Numbered list",
      "Insert image",
      "Add link",
    ]) {
      expect(
        within(toolbar).getByRole("button", { name: label }),
      ).toBeInTheDocument();
    }
  });

  it("omits heading controls when showHeadings is false", async () => {
    await setup(<ToolbarHarness content="" showHeadings={false} />);
    const toolbar = within(screen.getByRole("toolbar"));

    expect(
      toolbar.queryByRole("button", { name: "Heading" }),
    ).not.toBeInTheDocument();
    expect(toolbar.getByRole("button", { name: "Bold" })).toBeInTheDocument();
  });
});

describe("toolbar active state", () => {
  it("tracks the formatting at the cursor position", async () => {
    const { container } = await setup(
      <ToolbarHarness content="<h1>Title</h1><p>Body</p>" />,
    );
    const editor = getEditor(container);
    const headingButton = () => screen.getByRole("button", { name: "Heading" });

    act(() => {
      editor.commands.setTextSelection(2);
    });
    expect(headingButton()).toHaveAttribute("aria-pressed", "true");

    // Move cursor into the paragraph
    act(() => {
      editor.commands.setTextSelection(10);
    });
    expect(headingButton()).toHaveAttribute("aria-pressed", "false");
  });

  it("disables the bold button within headings", async () => {
    const { container } = await setup(
      <ToolbarHarness content="<h1>Title</h1><p>Body</p>" />,
    );
    const editor = getEditor(container);
    const boldButton = () =>
      container.querySelector('button[aria-label^="Bold"]');

    act(() => {
      editor.commands.setTextSelection(2);
    });
    expect(boldButton()).toBeDisabled();

    act(() => {
      editor.commands.setTextSelection(10);
    });
    expect(boldButton()).toBeEnabled();
  });
});

describe("link form", () => {
  it("updates the whole existing link", async () => {
    const { container, user } = await setup(
      <ToolbarHarness content='<p><a href="https://old.com">Example</a></p>' />,
    );
    const editor = getEditor(container);

    // Cursor within the link, no selection
    act(() => {
      editor.commands.setTextSelection(3);
    });
    await user.click(screen.getByRole("button", { name: "Edit link" }));
    const input = screen.getByRole("textbox", { name: "URL" });
    await user.clear(input);
    await user.type(input, "https://new.com{Enter}");

    expect(editor.getHTML()).toContain('href="https://new.com"');
    expect(editor.getHTML()).not.toContain("https://old.com");
    expect(editor.getHTML()).toContain(">Example</a>");
  });

  it("removes the whole existing link", async () => {
    const { container, user } = await setup(
      <ToolbarHarness content='<p><a href="https://old.com">Example</a></p>' />,
    );
    const editor = getEditor(container);

    act(() => {
      editor.commands.setTextSelection(3);
    });
    await user.click(screen.getByRole("button", { name: "Edit link" }));
    await user.click(screen.getByRole("button", { name: "Remove link" }));

    expect(editor.getHTML()).not.toContain("<a");
    expect(editor.getHTML()).toContain("Example");
  });

  it("closes without changes on Escape", async () => {
    const { container, user } = await setup(
      <ToolbarHarness content="<p>Hello world</p>" />,
    );
    const editor = getEditor(container);
    const before = editor.getHTML();

    act(() => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
    });
    await user.click(screen.getByRole("button", { name: "Add link" }));
    await user.type(
      screen.getByRole("textbox", { name: "URL" }),
      "example.com{Escape}",
    );

    expect(
      screen.queryByRole("textbox", { name: "URL" }),
    ).not.toBeInTheDocument();
    expect(editor.getHTML()).toBe(before);
  });

  it("does not create a link from a bare https:// prefix", async () => {
    const { container, user } = await setup(
      <ToolbarHarness content="<p>Hello world</p>" />,
    );
    const editor = getEditor(container);

    act(() => {
      editor.commands.setTextSelection({ from: 1, to: 6 });
    });
    await user.click(screen.getByRole("button", { name: "Add link" }));
    await user.click(screen.getByRole("button", { name: "Save link" }));

    expect(editor.getHTML()).not.toContain("<a");
  });
});

describe("rich text marker", () => {
  it("is only displayed on editable fields", async () => {
    const { container } = await setup(
      <>
        <div data-testid="editable">
          <RichTextInput value="" errorMessage={undefined} />
        </div>
        <div data-testid="disabled">
          <RichTextInput value="" errorMessage={undefined} disabled />
        </div>
      </>,
    );
    const marker = (testId: string) =>
      container.querySelector(`[data-testid="${testId}"] .rich-text-marker`);

    expect(marker("editable")).toBeInTheDocument();
    expect(marker("disabled")).not.toBeInTheDocument();
  });

  it("focuses the field when clicked", async () => {
    const { user, container } = await setup(
      <RichTextInput value="<p>Hello world</p>" errorMessage={undefined} />,
    );
    const field = container.querySelector(".ProseMirror");
    expect(field).not.toHaveFocus();

    await user.click(container.querySelector(".rich-text-marker")!);

    // Tiptap defers focus to the next animation frame
    await waitFor(() => expect(field).toHaveFocus());
  });
});

describe("when wrapped in a <label>", () => {
  // Clicking non-interactive content within a <label> forwards the click to the first labelable
  // descendant - this must not be a toolbar button
  it("does not apply formatting when clicking into the field whilst the toolbar is shown", async () => {
    const onChange = vi.fn();
    const { user, getByText, container } = await setup(
      <InputLabel label="Description">
        <RichTextInput
          value="<p>Hello world</p>"
          errorMessage={undefined}
          onChange={onChange}
        />
      </InputLabel>,
    );
    const editor = getEditor(container);

    // Select text so that the bubble menu is attached within the <label>
    act(() => {
      editor.chain().focus().setTextSelection({ from: 1, to: 6 }).run();
    });
    await screen.findByRole("toolbar");

    await user.click(getByText("Hello world"));

    expect(onChange).not.toHaveBeenCalled();
  });
});
