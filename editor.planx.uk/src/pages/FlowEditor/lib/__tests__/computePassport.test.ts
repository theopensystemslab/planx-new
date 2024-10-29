import { FullStore, useStore } from "../store";
import { flowWithDuplicatePassportVars } from "./mocks/computePassport/flowWithDuplicatePassportVars";

const { getState, setState } = useStore;

const { computePassport } = getState();

let initialState: FullStore;

beforeEach(() => {
  initialState = getState();
});

afterEach(() => setState(initialState));

describe("breadcrumbs where multiple nodes set the same passport value", () => {
  const breadcrumbs = {
    sIipiCHueb: {
      auto: false,
      data: {
        "application.information.sensitive": "test",
      },
    },
    "4oH6eI9TMm": {
      auto: false,
      answers: ["XZlpeuJt9o"],
    },
  };

  it("returns an array of both values", () => {
    setState({ flow: flowWithDuplicatePassportVars, breadcrumbs });
    const duplicateKey = "application.information.sensitive";

    const output = computePassport();
    expect(output.data).toHaveProperty(duplicateKey);
    expect(output.data?.[duplicateKey]).toEqual(
      expect.arrayContaining(["test", "true"]),
    );
  });

  it.skip("returns an array of both values, irrespective of the order of the breadcrumbs", () => {
    const breadcrumbs = {
      "4oH6eI9TMm": {
        auto: false,
        answers: ["XZlpeuJt9o"],
      },
      sIipiCHueb: {
        auto: false,
        data: {
          "application.information.sensitive": "test",
        },
      },
    };

    setState({ flow: flowWithDuplicatePassportVars, breadcrumbs });
    const duplicateKey = "application.information.sensitive";

    const output = computePassport();
    expect(output.data).toHaveProperty(duplicateKey);

    // Currently returning this value
    expect(output.data?.[duplicateKey]).toEqual("test");

    // But I think we should expect this?
    expect(output.data?.[duplicateKey]).toEqual(
      expect.arrayContaining(["test", "true"]),
    );
  });
});
