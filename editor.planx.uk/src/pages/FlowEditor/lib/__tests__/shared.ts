import { Flow, Op } from "../flow";
import { createDoc, getConnection } from "../sharedb";

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
      // cleanup, i.e. call done after removing the created doc
      doc.del(done);
    });

    doc.submitOp(ops);
  };
  return testFn;
};

test("helper", () => {
  expect(typeof createTest).toEqual("function");
});
