import { useStore } from "../../store";

const { getState } = useStore;
const { resultData, resetPreview } = getState();

beforeEach(() => {
  resetPreview();
});

test("Default result data", () => {
  expect(resultData()).toEqual({
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

test.todo("Returns correct result based on collected flags");

test.todo(
  "Returns correct, custom text based on collected flags and overrides",
);

test.todo("Returns result data for flagsets beyond `Planning permission`");
