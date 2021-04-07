const nock = require("nock");
const supertest = require("supertest");

const app = require("./server");

it("works", async () => {
  await supertest(app)
    .get("/")
    .expect(200)
    .then((response) => {
      expect(response.body).toEqual({ hello: "world" });
    });
});

// TODO: test with newer better BOPS endpoint & error handling
it("proxies request to BOPS with the correct information", async () => {
  const mockResponse = {
    application: "0000123",
  };

  nock("https://southwark.bops-staging.services/api/v1/planning_applications")
    .post("")
    .reply(200, mockResponse);

  await supertest(app)
    .post("/bops/southwark")
    .send({ hi: 123 })
    .expect(200)
    .then((response) => {
      expect(response.body).toEqual({
        application: { bopsResponse: { application: "0000123" } },
      });
    });
});

it("mocks hasura", async () => {
  await supertest(app)
    .get("/hasura")
    .expect(200)
    .then((res) => {
      expect(res.body).toEqual({ teams: [{ id: 1 }] });
    });
});
