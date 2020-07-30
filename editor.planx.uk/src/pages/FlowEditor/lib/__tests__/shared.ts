import { createDoc, getConnection } from "../sharedb";
import { Flow, Op } from "../flow";

export const createTest = (
  documentName: string,
  initial: Flow,
  ops: Op[],
  expected: Flow
) => {
  const testFn = async (done) => {
    const doc = getConnection(documentName);
    await createDoc(doc, initial);

    doc.on("op", () => {
      expect(doc.data).toEqual(expected);
      done();
      return;
    });

    doc.submitOp(ops);
  };
  return testFn;
};

test("helper", () => {
  expect(typeof createTest).toEqual("function");
});
