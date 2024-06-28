import { parseFormValues } from ".";

describe("parseFormValues util", () => {
  it("trims nested strings", () => {
    const input = {
      type: 100,
      data: {
        description: "description      ",
        fn: "my.data.field      ",
        img: "",
        text: "Question      ",
      },
    };
    const output = parseFormValues(Object.entries(input));

    expect(output.data.fn).toEqual("my.data.field");
    expect(output.data.text).toEqual("Question");
    expect(output.data.description).toEqual("description");
  })
});