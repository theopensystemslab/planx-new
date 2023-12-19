import { isCleanHTML, isObjectValid } from "./utils";

describe("isObjectValid", () => {
  it("calls the callback for each child if validator returns true", () => {
    const mockValidator = jest.fn().mockReturnValue(true);

    const testObject = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
        e: {
          f: 5,
        },
      },
    };

    isObjectValid(testObject, mockValidator);

    expect(mockValidator).toHaveBeenCalledTimes(5);
  });

  it("fails fast if any validator encounters any false values", () => {
    const mockValidator = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const testObject = {
      a: 1,
      b: {
        c: 2,
        d: [3, 4],
        e: {
          f: 5,
        },
      },
    };

    isObjectValid(testObject, mockValidator);

    expect(mockValidator).toHaveBeenCalledTimes(2);
  });

  it("handles arrays correctly", () => {
    const mockValidator = jest.fn().mockReturnValue(true);

    const testArray = [1, [2, 3], { a: 4 }];

    isObjectValid(testArray, mockValidator);

    expect(mockValidator).toHaveBeenCalledTimes(4);
  });

  it("handles an object containing an array of objects", () => {
    const mockValidator = jest.fn().mockReturnValue(true);

    const objectWithArrayOfObjects = {
      a: 1,
      b: {
        c: [{ d: 2, e: { f: 3 } }, { g: 4 }, { h: [5, 6] }],
      },
    };

    isObjectValid(objectWithArrayOfObjects, mockValidator);

    expect(mockValidator).toHaveBeenCalledTimes(6);
  });

  it("handles empty objects and arrays", () => {
    const mockValidator = jest.fn().mockReturnValue(true);

    const emptyObject = {};
    const emptyArray: unknown[] = [];

    isObjectValid(emptyObject, mockValidator);
    isObjectValid(emptyArray, mockValidator);

    expect(mockValidator).not.toHaveBeenCalled();
  });
});

describe("isCleanHTML() helper function", () => {
  const dirtyHTML = [
    "<img src=x onerror=alert(1)//>",
    "<svg><g/onload=alert(2)//<p>",
    "<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>",
    '<math><mi//xlink:href="data:x,<script>alert(4)</script>">',
    "<TABLE><tr><td>HELLO</tr></TABL>",
    "<UL><li><A HREF=//google.com>click</UL>",
  ];

  for (const example of dirtyHTML) {
    it(`returns false for example ${example}`, () => {
      expect(isCleanHTML(example)).toBe(false);
    });
  }

  const cleanHTML = [
    `<h1>Hello, World!</h1><p>This is simple HTML.</p>`,
    `<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>`,
    `<p>This is <b>bold</b> text and <i>italic</i> text.</p>`,
    `<div><p>This content is inside a div.</p></div>`,
    `<h2>Subheading</h2><p>This is a paragraph under the subheading.</p>`,
    `<div><h1>Main Title</h1><p>This is a <b>nested</b> paragraph with a <i>nested</i> element.</p></div>`,
    `<div><h1>Content with image</h1><img src="dogs.png" alt="Dog photo"></div>`,
  ];

  for (const example of cleanHTML) {
    it(`returns true for example ${example}`, () => {
      expect(isCleanHTML(example)).toBe(true);
    });
  }
});
