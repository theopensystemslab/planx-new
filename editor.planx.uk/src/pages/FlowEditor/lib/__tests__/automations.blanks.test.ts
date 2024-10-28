import { Store, useStore } from "../store";

const { getState, setState } = useStore;
const { resetPreview } = getState();

describe("Auto-answering blanks", () => {
  beforeEach(() => {
    resetPreview();
    setState({ flow });
  });

  test.todo("TODO");
})

const flow: Store.Flow = {};
