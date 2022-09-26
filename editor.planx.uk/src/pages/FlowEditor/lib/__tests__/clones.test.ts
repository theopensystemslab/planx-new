import { vanillaStore } from "../store";
const { getState, setState } = vanillaStore;
import flow from "./mocks/flowWithClones.json";

beforeEach(() => {
  getState().resetPreview();
});

describe("Clone order in flow", () => {
  test("Left branch is ordered correctly", () => {
    setState({ flow });
    getState().record("question", { answers: ["leftChoice"] });
    getState().record("leftChoice", { answers: ["leftNotice"] });
    // Left branch is structure as expected
    expect(getState().upcomingCardIds()).toEqual([
      "leftNotice",
      "clone",
      "leftConfirmation",
    ]);
    getState().record("leftNotice", { answers: ["clone"] });
    getState().record("clone", { answers: ["leftConfirmation"] });
    getState().record("leftConfirmation", { answers: ["finalCard"] });
    expect(getState().upcomingCardIds()).toHaveLength(0);
  });

  test("Right branch is ordered correctly", () => {
    setState({ flow });
    getState().record("question", { answers: ["rightChoice"] });
    getState().record("rightChoice", { answers: ["rightNotice"] });
    // Right branch is structured as expected
    expect(getState().upcomingCardIds()).toEqual([
      "rightNotice",
      "clone",
      "rightConfirmation",
    ]);
    getState().record("rightNotice", { answers: ["clone"] });
    getState().record("clone", { answers: ["rightConfirmation"] });
    getState().record("rightConfirmation", { answers: ["finalCard"] });
    expect(getState().upcomingCardIds()).toHaveLength(0);
  });
});
