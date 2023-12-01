import { vanillaStore } from "../../store";

const { getState, setState } = vanillaStore;

const { resetPreview } = getState();

describe("resetPreview", () => {
  test("should reset preview state correctly for a local storage session", async () => {
    setState({
      sessionId: "123",
    });

    resetPreview();
    expect(getState().sessionId).toBe("");
  });

  test("should reset preview state correctly for a save & return session", async () => {
    setState({
      sessionId: "123",
      saveToEmail: "test@council.gov.uk",
    });

    resetPreview();
    expect(getState().sessionId).toBe("");
    expect(getState().saveToEmail).toBe("");
  });
});
