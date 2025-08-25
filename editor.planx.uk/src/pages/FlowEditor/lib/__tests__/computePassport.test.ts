import { FullStore, useStore } from "../store";
import { flowWithDuplicatePassportVars } from "./mocks/computePassport/flowWithDuplicatePassportVars";
import { flowWithMultipleSetValues } from "./mocks/computePassport/flowWithMultipleSetValues";

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
    expect(output.data?.[duplicateKey]).toEqual(expect.arrayContaining(["test", "true"]));
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
    expect(output.data?.[duplicateKey]).toEqual("test")

    // But I think we should expect this?
    expect(output.data?.[duplicateKey]).toEqual(
      expect.arrayContaining(["test", "true"])
    );
  });
});

/**
 * computePassport() does not sort breadcrumbs by flow depth before each calculation
 * This would be both expensive and redundant (as breadcrumbs are ordered within the Zustand store)
 * 
 * Hasura sorts JSONB data alphabetically by key value on insert/update to lowcal_session.data
 * When fetching breadcrumb data from the DB, it is vital that we always re-sort breadcrumbs by flow depth on resume
 * Otherwise, computePassport() will return inconsistent results (see tests below)
 * 
 * See: resumeSession() - https://github.com/theopensystemslab/planx-new/blob/main/editor.planx.uk/src/pages/FlowEditor/lib/store/preview.ts#L450
 */
describe("breadcrumb order is significant when computing the passport", () => {
  it("returns passport based on alphabetical breadcrumb order", () => {
    const breadcrumbsByAlphabeticalOrder = {
      "3XgE43ozeR": {
        auto: true,
        data: {
          "application.fee.payable": ["456"],
        },
      },
      MEi1WhBeua: {
        auto: true,
        data: {
          "application.fee.payable": ["123"],
        },
      },
    };

    setState({
      flow: flowWithMultipleSetValues,
      breadcrumbs: breadcrumbsByAlphabeticalOrder,
    });
    const duplicateKey = "application.fee.payable";

    const output = computePassport();
    expect(output.data).toHaveProperty(duplicateKey);

    // "Last" breadcrumb
    expect(output.data?.[duplicateKey][0]).toEqual("123");
  });

  it("returns passport based on flow order (breadcrumb depth)", () => {
    const breadcrumbsByFlowDepth = {
      MEi1WhBeua: {
        auto: true,
        data: {
          "application.fee.payable": ["123"],
        },
      },
      "3XgE43ozeR": {
        auto: true,
        data: {
          "application.fee.payable": ["456"],
        },
      },
    };

    setState({
      flow: flowWithMultipleSetValues,
      breadcrumbs: breadcrumbsByFlowDepth,
    });
    const duplicateKey = "application.fee.payable";

    const output = computePassport();
    expect(output.data).toHaveProperty(duplicateKey);

    // "Last" breadcrumb
    expect(output.data?.[duplicateKey][0]).toEqual("456");
  });
});