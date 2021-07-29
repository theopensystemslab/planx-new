const nock = require("nock");
const supertest = require("supertest");
const passport = require("passport");

const app = require("./server");

it("works", async () => {
  const strategy = passport._strategies;
  strategy._token_response = {
    access_token: "at-1234",
    expires_in: 100000,
  };

  strategy._profile = {
    id: 1234,
    provider: "google",
    displayName: "Hi",
    emails: [{ value: "fjdklajfds@example.com" }],
  };

  await supertest(app).get("/auth/google").expect(302);

  await supertest(app)
    .post("/flows/1/publish")
    .expect(200)
    .then((res) => console.log(res));
});
