import { vanillaStore } from "../store";
const { getState, setState } = vanillaStore;
import forwardsFlow from "./mocks/flowWithClones.json";
import reverseFlow from "./mocks/flowWithReverseClones.json";

const { record, previousCard, getCurrentCard, upcomingCardIds, resetPreview } =
  getState();

beforeEach(() => {
  resetPreview();
});

describe("Clone order in flow (forwards)", () => {
  test("Left branch is ordered correctly", () => {
    setState({ flow: forwardsFlow });
    record("question", { answers: ["leftChoice"] });
    record("leftChoice", { answers: ["leftNotice"] });
    // Left branch is structure as expected
    expect(upcomingCardIds()).toEqual([
      "leftNotice",
      "clone",
      "leftConfirmation",
    ]);
    record("leftNotice", { answers: ["clone"] });
    record("clone", { answers: ["leftConfirmation"] });
    record("leftConfirmation", { answers: ["finalNode"] });
    expect(upcomingCardIds()).toHaveLength(0);
  });

  test.skip("Right branch is ordered correctly", () => {
    setState({ flow: forwardsFlow });
    record("question", { answers: ["rightChoice"] });
    record("rightChoice", { answers: ["rightNotice"] });
    // Right branch is structured as expected
    expect(upcomingCardIds()).toEqual([
      "rightNotice",
      "clone",
      "rightConfirmation",
    ]);
    record("rightNotice", { answers: ["clone"] });
    record("clone", { answers: ["rightConfirmation"] });
    record("rightConfirmation", { answers: ["finalNode"] });
    expect(upcomingCardIds()).toHaveLength(0);
  });
});

describe("Clone order in flow (backwards)", () => {
  test("Left branch is ordered correctly", () => {
    setState({ flow: reverseFlow });

    const initialUpcomingCards = ["question", "finalNode"];
    expect(upcomingCardIds()).toEqual(initialUpcomingCards);

    // Traverse forward to final node
    record("question", { answers: ["leftChoice"] });
    record("clone", { answers: ["finalNode"] });
    expect(getCurrentCard()?.id).toBe("finalNode");

    // Traverse back one-by-one to first node
    let previous = previousCard(getCurrentCard());
    expect(previous).toBe("clone");
    record(previous!);

    previous = previousCard(getCurrentCard());
    expect(previous).toBe("question");
    record(previous!);

    // State is back to where we started
    expect(upcomingCardIds()).toEqual(initialUpcomingCards);
  });

  test.skip("Right branch is ordered correctly", () => {
    setState({ flow: reverseFlow });

    const initialUpcomingCards = ["question", "finalNode"];
    expect(upcomingCardIds()).toEqual(initialUpcomingCards);

    // Traverse forward to final node
    record("question", { answers: ["rightChoice"] });
    record("rightNotice", { answers: ["clone"] });
    record("clone", { answers: ["finalNode"] });
    expect(getCurrentCard()?.id).toBe("finalNode");

    // Traverse back one-by-one to first node
    let previous = previousCard(getCurrentCard());
    expect(previous).toBe("clone");
    record(previous!);

    previous = previousCard(getCurrentCard());
    expect(previous).toBe("rightNotice");
    record(previous!);

    previous = previousCard(getCurrentCard());
    expect(previous).toBe("question");
    record(previous!);

    // State is back to where we started
    expect(upcomingCardIds()).toEqual(initialUpcomingCards);
  });
});
