import { createDoc, getConnection } from "./sharedb";

test("send a req", async (done) => {
  const doc = getConnection("testing");
  await createDoc(doc, { nodes: {}, edges: [] });

  doc.on("op", (op, isLocal) => {
    expect(doc.data).toEqual({
      nodes: {
        test: {},
      },
      edges: [],
    });
    done();
  });

  doc.submitOp([{ p: ["nodes", "test"], oi: {} }]);
});
