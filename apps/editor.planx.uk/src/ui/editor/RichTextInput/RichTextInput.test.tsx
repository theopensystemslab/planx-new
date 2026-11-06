import { screen, within } from "@testing-library/react";
import { setup } from "test/utils";

import RichTextInput from "./RichTextInput";
import { fromHtml, modifyDeep, toHtml } from "./utils";

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
    expect(container.querySelector(".rte-marker")).toHaveTextContent("AA");
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
