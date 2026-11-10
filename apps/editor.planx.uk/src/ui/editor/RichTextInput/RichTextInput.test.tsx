import { act, screen, within } from "@testing-library/react";
import type { Editor } from "@tiptap/core";
import { setup } from "test/utils";
import InputLabel from "ui/editor/InputLabel";
import { vi } from "vitest";

import RichTextInput from "./RichTextInput";
import { fromHtml, modifyDeep, toHtml } from "./utils";

// jsdom does not implement document.elementFromPoint, which ProseMirror calls on mousedown
beforeAll(() => {
  Object.defineProperty(document, "elementFromPoint", {
    value: vi.fn(() => null),
    writable: true,
    configurable: true,
  });
});

afterAll(() => {
  // @ts-expect-error - removing the stub restores jsdom's default (unimplemented) state
  delete document.elementFromPoint;
});

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
  // The toolbar is always rendered for editable fields, but hidden with CSS until the field has focus
  const getToolbar = () => screen.getByRole("toolbar", { hidden: true });

  it("renders labelled formatting controls", async () => {
    // Accessible names aren't computed for hidden elements, so assert on aria-label directly
    await setup(<RichTextInput value="" errorMessage={undefined} />);
    const toolbar = getToolbar();

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
        toolbar.querySelector(`button[aria-label="${label}"]`),
      ).toBeInTheDocument();
    }
    expect(getToolbar()).toHaveAttribute("aria-label", "Text formatting");
  });

  it("omits heading controls for paragraph content", async () => {
    await setup(
      <RichTextInput
        value=""
        errorMessage={undefined}
        variant="paragraphContent"
      />,
    );
    const toolbar = within(getToolbar());

    expect(toolbar.queryByLabelText("Heading")).not.toBeInTheDocument();
    expect(toolbar.getByLabelText("Bold")).toBeInTheDocument();
  });

  it("displays a rich text marker", async () => {
    const { container } = await setup(
      <RichTextInput value="" errorMessage={undefined} />,
    );
    expect(container.querySelector(".rte-marker")).toHaveTextContent("Aa");
  });

  it("does not render a toolbar or marker when disabled", async () => {
    const { container } = await setup(
      <RichTextInput value="" errorMessage={undefined} disabled />,
    );
    expect(
      screen.queryByRole("toolbar", { hidden: true }),
    ).not.toBeInTheDocument();
    expect(container.querySelector(".rte-marker")).not.toBeInTheDocument();
  });

  it("renders a single toolbar per field", async () => {
    await setup(
      <>
        <RichTextInput value="" errorMessage={undefined} />
        <RichTextInput value="" errorMessage={undefined} />
      </>,
    );
    expect(screen.getAllByRole("toolbar", { hidden: true })).toHaveLength(2);
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

    await user.click(container.querySelector(".rte-marker")!);

    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("toolbar active state", () => {
  it("tracks the formatting at the cursor position", async () => {
    const { container } = await setup(
      <RichTextInput
        value="<h1>Title</h1><p>Body</p>"
        errorMessage={undefined}
        onChange={vi.fn()}
      />,
    );
    // Tiptap exposes the editor instance on its root DOM node
    const editor = (
      container.querySelector(".ProseMirror") as unknown as {
        editor: Editor;
      }
    ).editor;
    const headingButton = () =>
      container.querySelector('button[aria-label="Heading"]');

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
      <RichTextInput
        value="<h1>Title</h1><p>Body</p>"
        errorMessage={undefined}
        onChange={vi.fn()}
      />,
    );
    const editor = (
      container.querySelector(".ProseMirror") as unknown as { editor: Editor }
    ).editor;
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
