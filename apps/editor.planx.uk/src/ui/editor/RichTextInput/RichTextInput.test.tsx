import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import type { Editor } from "@tiptap/core";
import { delay, http } from "msw";
import server from "test/mockServer";
import { setup } from "test/utils";
import InputLabel from "ui/editor/InputLabel";
import { vi } from "vitest";

import RichTextInput from "./RichTextInput";
import type { Props } from "./types";
import { fromHtml, modifyDeep, toHtml } from "./utils";

const nativeFocus = HTMLElement.prototype.focus;

const isRendered = (el: Element) => {
  for (let node: Element | null = el; node; node = node.parentElement) {
    if (getComputedStyle(node).display === "none") return false;
  }
  return true;
};

// jsdom does not implement layout APIs which ProseMirror calls on mousedown (elementFromPoint)
// and when scrolling the selection into view (Range rects)
beforeAll(() => {
  Object.defineProperty(document, "elementFromPoint", {
    value: vi.fn(() => null),
    writable: true,
    configurable: true,
  });
  Range.prototype.getClientRects = vi.fn(() => [] as unknown as DOMRectList);
  Range.prototype.getBoundingClientRect = vi.fn(() => new DOMRect());
  // Browsers cannot focus elements which are not rendered, but jsdom can
  // The toolbar is hidden (display: none) without focus, so emulate this to catch lost focus
  HTMLElement.prototype.focus = function (options) {
    if (isRendered(this)) nativeFocus.call(this, options);
  };
});

afterAll(() => {
  // @ts-expect-error - removing the stubs restores jsdom's default (unimplemented) state
  delete document.elementFromPoint;
  // @ts-expect-error - as above
  delete Range.prototype.getClientRects;
  // @ts-expect-error - as above
  delete Range.prototype.getBoundingClientRect;
  HTMLElement.prototype.focus = nativeFocus;
});

const focusField = (container: HTMLElement) =>
  act(() => {
    container.querySelector<HTMLElement>(".ProseMirror")!.focus();
  });

/**
 * Render an editable field and focus it, so that its toolbar is visible (:focus-within)
 */
const renderField = async (value: string, props: Partial<Props> = {}) => {
  const result = await setup(
    <RichTextInput
      value={value}
      errorMessage={undefined}
      onChange={vi.fn()}
      {...props}
    />,
  );
  focusField(result.container);
  return result;
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
    await renderField("");
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

  it("is only visible on the focused field", async () => {
    const { container } = await setup(
      <>
        <RichTextInput value="" errorMessage={undefined} />
        <RichTextInput value="" errorMessage={undefined} />
      </>,
    );
    // Rendered for each field, but hidden until focused
    expect(screen.getAllByRole("toolbar", { hidden: true })).toHaveLength(2);
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();

    focusField(container);
    expect(screen.getAllByRole("toolbar")).toHaveLength(1);
  });

  it("is not rendered when disabled", async () => {
    await setup(<RichTextInput value="" errorMessage={undefined} disabled />);
    expect(
      screen.queryByRole("toolbar", { hidden: true }),
    ).not.toBeInTheDocument();
  });

  it("keeps focus within the field when pressing a non-interactive part of the toolbar", async () => {
    await renderField("");
    const divider = screen.getAllByRole("separator")[0];

    // mousedown returns false when its default action (moving focus) is cancelled
    expect(fireEvent.mouseDown(divider)).toBe(false);
  });

  it("omits heading controls for paragraph content", async () => {
    await renderField("", { variant: "paragraphContent" });
    const toolbar = within(screen.getByRole("toolbar"));

    expect(
      toolbar.queryByRole("button", { name: "Heading" }),
    ).not.toBeInTheDocument();
    expect(toolbar.getByRole("button", { name: "Bold" })).toBeInTheDocument();
  });
});

describe("toolbar active state", () => {
  it("tracks the formatting at the cursor position", async () => {
    const { container } = await renderField("<h1>Title</h1><p>Body</p>");
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
    const { container } = await renderField("<h1>Title</h1><p>Body</p>");
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

describe("pressing a control outside the focused field", () => {
  // Hiding the toolbar on mousedown would shift the control out from under the pointer before
  // mouseup, so the click would be lost - layout must not change until the press is released
  it("holds the toolbar open until the press is released", async () => {
    const onSave = vi.fn();
    const { user, container } = await setup(
      <>
        <RichTextInput value="" errorMessage={undefined} />
        <button onClick={onSave}>Save</button>
      </>,
    );
    focusField(container);
    const save = screen.getByRole("button", { name: "Save" });

    await user.pointer({ keys: "[MouseLeft>]", target: save });
    expect(save).toHaveFocus();
    expect(screen.getByRole("toolbar")).toBeInTheDocument();

    await user.pointer({ keys: "[/MouseLeft]", target: save });
    expect(onSave).toHaveBeenCalledTimes(1);
    await waitFor(() =>
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument(),
    );
  });

  it("hides the toolbar immediately when focus leaves by keyboard", async () => {
    const { user, container } = await setup(
      <>
        <RichTextInput value="" errorMessage={undefined} />
        <button>Save</button>
      </>,
    );
    focusField(container);

    act(() => {
      screen.getByRole("button", { name: "Save" }).focus();
    });

    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    // No press in progress, so no stale listeners hold the toolbar open later
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
  });
});

describe("image upload", () => {
  it("keeps the toolbar visible whilst uploading", async () => {
    // Hold the upload open, so the button stays in its loading state
    server.use(
      http.post(`${import.meta.env.VITE_APP_API_URL}/file/public/upload`, () =>
        delay("infinite"),
      ),
    );
    const { user, getByTestId } = await renderField("<p>Hello</p>");

    await user.click(screen.getByRole("button", { name: "Insert image" }));
    // The file dialog sets the input's files directly, rather than the user clicking it
    fireEvent.change(getByTestId("upload-file-input"), {
      target: { files: [new File(["x"], "image.png", { type: "image/png" })] },
    });

    expect(
      await screen.findByRole("button", { name: "Insert image", busy: true }),
    ).toBeInTheDocument();
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });
});

describe("link form", () => {
  it("focuses the URL input when opened", async () => {
    const { user } = await renderField("<p>Hello</p>");

    await user.click(screen.getByRole("button", { name: "Add link" }));

    expect(screen.getByRole("textbox", { name: "URL" })).toHaveFocus();
  });

  it("updates the whole existing link", async () => {
    const { container, user } = await renderField(
      '<p><a href="https://old.com">Example</a></p>',
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
    const { container, user } = await renderField(
      '<p><a href="https://old.com">Example</a></p>',
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
    const { container, user } = await renderField("<p>Hello world</p>");
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

  it("inserts the URL as link text when nothing is selected", async () => {
    const { container, user } = await renderField("<p>Hello</p>");
    const editor = getEditor(container);

    act(() => {
      editor.commands.setTextSelection(6);
    });
    await user.click(screen.getByRole("button", { name: "Add link" }));
    await user.type(
      screen.getByRole("textbox", { name: "URL" }),
      "example.com{Enter}",
    );

    expect(editor.getHTML()).toContain(
      '<a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com">https://example.com</a>',
    );
  });

  it("does not create a link from a bare https:// prefix", async () => {
    const { container, user } = await renderField("<p>Hello world</p>");
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
  it("does not apply formatting when clicking into the field", async () => {
    const onChange = vi.fn();
    const { user, getByText } = await setup(
      <InputLabel label="Description">
        <RichTextInput
          value="<p>Hello world</p>"
          errorMessage={undefined}
          onChange={onChange}
        />
      </InputLabel>,
    );
    // Click into the field, then click again whilst it's focused and the toolbar is visible
    await user.click(getByText("Hello world"));
    await user.click(getByText("Hello world"));

    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not apply formatting when clicking the rich text marker", async () => {
    const onChange = vi.fn();
    const { user, container } = await setup(
      <InputLabel label="Description">
        <RichTextInput
          value="<p>Hello world</p>"
          errorMessage={undefined}
          onChange={onChange}
        />
      </InputLabel>,
    );

    await user.click(container.querySelector(".rich-text-marker")!);

    expect(onChange).not.toHaveBeenCalled();
  });
});
