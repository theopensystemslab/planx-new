import { getResultData } from "../store/preview";

test("result data", () => {
  const result = getResultData({}, {});

  expect(result).toEqual({
    "Planning permission": {
      displayText: { description: "Planning permission", heading: "No result" },
      flag: {
        bgColor: "#EEEEEE",
        category: "Planning permission",
        color: "#000000",
        text: "No result",
        value: undefined,
        description: "",
      },
      responses: [],
    },
  });
});
