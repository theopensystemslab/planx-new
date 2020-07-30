import { Flow, Op } from "../flow";
import Backend from "sharedb";

export const createTest = (
  documentName: string,
  initial: Flow,
  ops: Op[],
  expected: Flow
) => {
  const testFn = async (done) => {
    const backend = new Backend();
    const connection = backend.connect();
    const doc = connection.get("flows", documentName);

    await new Promise(async (res, rej) => {
      doc.create(initial, (err) => {
        if (err) rej(err);
        res();
      });
    });

    doc.on("op", () => {
      expect(doc.data).toEqual(expected);
      backend.close();
      done();
    });

    doc.submitOp(ops);
  };
  return testFn;
};

test("helper", () => {
  expect(typeof createTest).toEqual("function");
});
