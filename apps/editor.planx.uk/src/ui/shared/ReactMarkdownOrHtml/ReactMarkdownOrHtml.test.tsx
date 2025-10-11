import { incrementHeaderElements } from "./ReactMarkdownOrHtml";

describe("Header element incrementor", () => {
  it("should return HTML unaltered if it does not contain H1 or H2 tags", () => {
    const input = `
      <p>Paragraph</p>
      <a href="#" target="_self">Anchor</a>
      <em>Italics</em>
      <b>Bold</b>
    `;
    const result = incrementHeaderElements(input);
    expect(result).toEqual(input);
  });

  it("should increment a single H1 to a H2", () => {
    const input = `
      <p>Paragraph</p>
      <a href="#" target="_self">Anchor</a>
      <em>Italics</em>
      <h1>H1 Element</h1>
      <b>Bold</b>
    `;
    const expectedOutput = `
      <p>Paragraph</p>
      <a href="#" target="_self">Anchor</a>
      <em>Italics</em>
      <h2>H1 Element</h2>
      <b>Bold</b>
    `;
    const result = incrementHeaderElements(input);
    expect(result).toEqual(expectedOutput);
  });

  it("should increment a single H2 to a H3", () => {
    const input = `
      <p>Paragraph</p>
      <a href="#" target="_self">Anchor</a>
      <em>Italics</em>
      <h2>H2 Element</h2>
      <b>Bold</b>
    `;
    const expectedOutput = `
      <p>Paragraph</p>
      <a href="#" target="_self">Anchor</a>
      <em>Italics</em>
      <h3>H2 Element</h3>
      <b>Bold</b>
    `;
    const result = incrementHeaderElements(input);
    expect(result).toEqual(expectedOutput);
  });

  it("should increment multiple H1 and H2 elements", () => {
    const input = `
      <h1>H1 Element</h1>
      <a href="#" target="_self">Anchor</a>
      <h2>H2 Element</h2>
      <em>Italics</em>
      <h1>H1 Element</h1>
      <b>Bold</b>
      <h2>H2 Element</h2>
    `;
    const expectedOutput = `
      <h2>H1 Element</h2>
      <a href="#" target="_self">Anchor</a>
      <h3>H2 Element</h3>
      <em>Italics</em>
      <h2>H1 Element</h2>
      <b>Bold</b>
      <h3>H2 Element</h3>
    `;
    const result = incrementHeaderElements(input);
    expect(result).toEqual(expectedOutput);
  });
});
