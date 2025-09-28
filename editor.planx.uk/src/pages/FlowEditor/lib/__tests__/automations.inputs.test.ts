import { useStore } from "../store";

const { getState } = useStore;
const { resetPreview } = getState();

describe("Auto-answering inputs", () => {
  beforeEach(() => {
    resetPreview();
  });

  test.todo(
    "Subsequent date inputs with the same data field auto-answer the second node",
  );

  test.todo(
    "Address inputs on different branches with the same data field auto-answer the second node",
  );

  test.todo(
    "Text inputs with the same data field auto-answer the second one independent of variant",
  );

  test.todo(
    "Number inputs with different data fields do not auto-answer each other",
  );
});
