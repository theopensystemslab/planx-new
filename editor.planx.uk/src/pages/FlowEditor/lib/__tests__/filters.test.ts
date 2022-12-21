import { vanillaStore } from "../store";
import flowWithSingleFilter from "./mocks/flowWithSingleFilter.json";

const { getState, setState } = vanillaStore;
const { upcomingCardIds, resetPreview } = getState();

// https://i.imgur.com/k0kkKox.png
describe("Single filter", () => {
  beforeEach(() => {
    resetPreview();
  });

  test.skip("don't expand filters before visiting them (A)", () => {
    setState({
      flow: flowWithSingleFilter,
    });

    expect(upcomingCardIds()).toEqual([
      "d5SxIWZej9",
      "LAz2YqYChs",
      "nroxFPM2Jx",
    ]);
  });

  test("immune path (B)", () => {
    setState({
      flow: flowWithSingleFilter,
      breadcrumbs: {
        d5SxIWZej9: {
          auto: false,
          answers: ["FZ1kmhT37j"],
        },
      },
    });

    expect(upcomingCardIds()).toEqual(["TmpbJgjGPH", "nroxFPM2Jx"]);
  });

  test("not immune path (C)", () => {
    setState({
      flow: flowWithSingleFilter,
      breadcrumbs: {
        d5SxIWZej9: {
          auto: false,
          answers: ["ZTZqcDAOoG"],
        },
      },
    });

    expect(upcomingCardIds()).toEqual(["lOrm4XmVGv", "nroxFPM2Jx"]);
  });
});
