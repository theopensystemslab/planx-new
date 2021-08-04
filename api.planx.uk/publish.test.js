const supertest = require("supertest");

const { authHeader } = require("./tests/mockJWT");

const app = require("./server");

it("works", async () => {
  await supertest(app)
    .post("/flows/1/publish")
    .set(authHeader())
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({
        alteredNodes: null,
        message: "No new changes",
      });
    });
});
