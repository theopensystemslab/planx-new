import { richText } from "./yupExtensions";

describe("richText validation", () => {
  describe("link formatting", () => {
    it("does not display an error if the text '(opens in a new tab)' is wrapped in an anchor element", () => {
      const result = richText().validate(
        '<a href="#">Some link (opens in a new tab)</a>',
      );
      expect(result).toBeDefined();
    });

    it("displays an error if the text '(opens in a new tab)' is not wrapped in an anchor element", async () => {
      await expect(() =>
        richText().validate(
          '<p><a href="#">Some link</a> (opens in a new tab)</p>',
        ),
      ).rejects.toThrow('Links must wrap the text "(opens in a new tab)".');
    });

    it("displays an error if the policy legislation link contains '/made'", async () => {
      await expect(() =>
        richText().validate(
          '<p><a href="https://www.legislation.gov.uk/ukpga/2023/36/section/3/made">Link to policy</a></p>',
        ),
      ).rejects.toThrow(
        'Legislative policy links should not end in "/made" as these can be out of date.',
      );
    });

    it("does not display an error if the policy legislation link does not contain '/made'", () => {
      const result = richText().validate(
        '<p><a href="https://www.legislation.gov.uk/ukpga/2023/36/section/3">Link to policy</a></p>',
      );
      expect(result).toBeDefined();
    });

    it("displays an error for short links (fewer than 8 characters)", async () => {
      await expect(() =>
        richText().validate('<p><a href="https://www.planx.uk">Short!</a></p>'),
      ).rejects.toThrow(
        "Make sure the link text accurately describes the what the link is for.",
      );
    });

    it("displays an error for not non-descriptive links", async () => {
      await expect(() =>
        richText().validate(
          '<p><a href="https://www.planx.uk">Click here!</a></p>',
        ),
      ).rejects.toThrow(
        "Links must be set over text that accurately describes what the link is for. Avoid generic language such as 'click here'.",
      );

      await expect(() =>
        richText().validate(
          '<p><a href="https://www.planx.uk">Try clicking here!</a></p>',
        ),
      ).rejects.toThrow(
        "Links must be set over text that accurately describes what the link is for. Avoid generic language such as 'click here'.",
      );
    });
  });

  describe("content hierarchy (headings)", () => {
    describe("root level content", () => {
      it("must start with a H1", async () => {
        await expect(() =>
          richText({ variant: "rootLevelContent" }).validate(`
            <p>Paragraph</p>
            <h1>Heading</h1>
          `),
        ).rejects.toThrow(
          "The document must start with a level 1 heading (H1).",
        );
      });

      it("can only contain a single H1", async () => {
        await expect(() =>
          richText({ variant: "rootLevelContent" }).validate(`
            <h1>Heading</h1>
            <h1>Another heading</h1>
          `),
        ).rejects.toThrow(
          "There cannot be more than one level 1 heading (H1) in the document.",
        );
      });

      it("does not allow a H2 to come before a H1", async () => {
        await expect(() =>
          richText({ variant: "rootLevelContent" }).validate(`
            <h2>Heading</h2>
            <h1>Another heading</h1>
          `),
        ).rejects.toThrow(
          "The document must start with a level 1 heading (H1).",
        );
      });

      it("allows correctly formatted headings", () => {
        const result = richText().validate(`
            <h1>Heading 1</h1>
            <h2>Heading 2</h2>
            <h3>Heading 3</h3>
        `);
        expect(result).toBeDefined();
      });
    });

    describe("non-root level content", () => {
      it("does not allow a H2 to come before a H1", async () => {
        await expect(() =>
          richText().validate(`
            <h2>Heading</h2>
            <h1>Another heading</h1>
          `),
        ).rejects.toThrow(
          "A level 2 heading (H2) must come before a level 3 heading (H3).",
        );
      });

      it("does not allow a H3 to come before a H2", async () => {
        await expect(() =>
          richText().validate(`
            <h2>Heading</h2>
            <h1>Another heading</h1>
          `),
        ).rejects.toThrow(
          "A level 2 heading (H2) must come before a level 3 heading (H3).",
        );
      });

      it("allows correctly formatted headings", async () => {
        const result = richText().validate(`
          <h1>Heading</h1>
          <h2>Another heading</h2>
        `);
        expect(result).toBeDefined();
      });
    });
  });

  describe("image alt text", () => {
    it("allows images with valid alt text", () => {
      const result = richText().validate('<img src="#" alt="some picture"/>');
      expect(result).toBeDefined();
    });

    it("rejects images without alt text", async () => {
      await expect(() => richText().validate('<img src="#"/>')).rejects.toThrow(
        "Accessibility error: Fallback (alternate) text must be assigned for all images.",
      );
    });
  });

  describe("'required' param", () => {
    it("rejects empty content when 'required' is true", async () => {
      await expect(() =>
        richText({ required: true }).validate(""),
      ).rejects.toThrow("Field is required");
    });

    it("accepts empty content when 'required' is false", async () => {
      const result = richText().validate("");
      expect(result).toBeDefined();
    });
  });
});
